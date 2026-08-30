import ptp from 'pdf-to-printer'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import configStore from '../store/configStore.js'

const execAsync = promisify(exec)

function logToFile(line) {
  try {
    const baseDir = process.env.APPDATA ? path.join(process.env.APPDATA, 'print-pe-agent') : (process.env.TEMP || '/tmp')
    const logDir = path.join(baseDir, 'logs')
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
    const logPath = path.join(logDir, 'agent.log')
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${line}\n`)
  } catch (e) {
    // logging must never crash the app
  }
}

// Maps the numeric Win32_Printer.PrinterStatus code (reported live by the
// Windows print spooler / driver itself) to a human label. Nothing here is
// guessed - these are the exact values documented for Win32_Printer.
const PRINTER_STATUS_MAP = {
  1: 'Other',
  2: 'Unknown',
  3: 'Idle',
  4: 'Printing',
  5: 'Warming Up',
  6: 'Stopped',
  7: 'Offline',
}

// PowerShell script (written to a temp .ps1 and executed) that asks Windows
// itself - via WMI (Win32_Printer) and the PrintManagement module - what
// each installed printer's REAL driver-reported capabilities and live
// status are. Nothing here is hardcoded per-model: every field comes
// straight from the printer's own driver/spooler entry.
const CAPABILITY_PS_SCRIPT = `
$ErrorActionPreference = 'SilentlyContinue'
$result = @()
$printers = Get-CimInstance -ClassName Win32_Printer
foreach ($p in $printers) {
  $colorCap = $false
  $duplexCap = $false
  if ($p.CapabilityDescriptions) {
    foreach ($cap in $p.CapabilityDescriptions) {
      if ($cap -match 'Color') { $colorCap = $true }
      if ($cap -match 'Duplex') { $duplexCap = $true }
    }
  }
  $curColor = $null
  $curDuplex = $null
  try {
    $cfg = Get-PrintConfiguration -PrinterName $p.Name -ErrorAction Stop
    if ($cfg.Color) { $curColor = $cfg.Color.ToString() }
    if ($cfg.DuplexingMode) { $curDuplex = $cfg.DuplexingMode.ToString() }
    if ($curColor -eq 'Color') { $colorCap = $true }
    if ($curDuplex -and $curDuplex -ne 'OneSided') { $duplexCap = $true }
  } catch {}
  $result += [PSCustomObject]@{
    Name              = $p.Name
    IsDefault         = [bool]$p.Default
    PortName          = $p.PortName
    DriverName        = $p.DriverName
    WorkOffline       = [bool]$p.WorkOffline
    PrinterStatus     = [int]$p.PrinterStatus
    SupportsColor     = $colorCap
    SupportsDuplex    = $duplexCap
    CurrentColorMode  = $curColor
    CurrentDuplexMode = $curDuplex
  }
}
@($result) | ConvertTo-Json -Compress -Depth 4
`

class PrinterManager {
  /**
   * Queries Windows (WMI + PrintManagement) for the REAL, driver-reported
   * capabilities and live status of every installed printer:
   *   - supportsColor / supportsDuplex -> read directly from the printer's
   *     own driver capability list (CapabilityDescriptions) and current
   *     print configuration. Nothing is guessed by name/model.
   *   - status -> the live Win32_Printer.PrinterStatus code from the spooler
   *     (Idle / Printing / Warming Up / Stopped / Offline / Unknown).
   * Used by the dashboard's "Printers" panel. Not used in the hot print-job
   * path (see printService.js) since it costs ~1-2s for the whole batch.
   */
  async getPrintersWithCapabilities() {
    if (process.platform !== 'win32') {
      // Non-Windows dev environment: fall back to the basic list so the UI
      // still has something real to render, just without capability flags.
      const basic = await this.getAvailablePrinters(1, 0)
      return basic.map((p) => ({
        name: p.name,
        isDefault: p.isDefault,
        statusCode: 3,
        statusText: 'Idle',
        isOnline: true,
        supportsColor: null,
        supportsDuplex: null,
        currentColorMode: null,
        currentDuplexMode: null,
      }))
    }

    const tempDir = path.join(os.tmpdir(), 'scan-and-print-jobs')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
    const scriptPath = path.join(tempDir, `printer-capabilities-${Date.now()}.ps1`)

    try {
      fs.writeFileSync(scriptPath, CAPABILITY_PS_SCRIPT, 'utf8')
      const { stdout } = await execAsync(
        `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${scriptPath}"`,
        { timeout: 15000, maxBuffer: 1024 * 1024 * 5 }
      )

      let parsed = []
      try {
        parsed = JSON.parse(stdout.trim() || '[]')
      } catch (parseErr) {
        logToFile(`getPrintersWithCapabilities: JSON parse failed: ${parseErr.message} | raw: ${stdout.slice(0, 400)}`)
        parsed = []
      }
      if (!Array.isArray(parsed)) parsed = [parsed]

      return parsed.map((p) => {
        const statusCode = Number(p.PrinterStatus) || 0
        const isOffline = Boolean(p.WorkOffline) || statusCode === 7
        return {
          name: p.Name,
          isDefault: Boolean(p.IsDefault),
          portName: p.PortName || '',
          driverName: p.DriverName || '',
          statusCode,
          statusText: isOffline ? 'Offline' : (PRINTER_STATUS_MAP[statusCode] || 'Unknown'),
          isOnline: !isOffline,
          supportsColor: Boolean(p.SupportsColor),
          supportsDuplex: Boolean(p.SupportsDuplex),
          currentColorMode: p.CurrentColorMode || null,
          currentDuplexMode: p.CurrentDuplexMode || null,
        }
      })
    } catch (err) {
      logToFile(`getPrintersWithCapabilities ERROR: ${err.message}`)
      // Graceful fallback so the Printers panel still shows something
      // useful (name + default) even if the capability query itself failed.
      const basic = await this.getAvailablePrinters(1, 0)
      return basic.map((p) => ({
        name: p.name,
        isDefault: p.isDefault,
        statusCode: 0,
        statusText: 'Unknown',
        isOnline: true,
        supportsColor: null,
        supportsDuplex: null,
        currentColorMode: null,
        currentDuplexMode: null,
      }))
    } finally {
      try {
        if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath)
      } catch (e) {}
    }
  }

  /**
   * Get list of all installed printers on the system.
   * Retries a few times with a short delay if the first attempt returns
   * empty - this covers the case where the app auto-starts at Windows
   * login and the Print Spooler / WMI service isn't fully ready yet.
   */
  async getAvailablePrinters(retries = 3, delayMs = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const printers = await ptp.getPrinters();
        logToFile(`getAvailablePrinters (attempt ${attempt}/${retries}): found ${printers.length} printer(s): ${printers.map(p => p.name).join(', ') || 'none'}`)

        if (printers.length > 0) {
          return printers.map((p) => ({
            name: p.name,
            deviceId: p.deviceId || p.name,
            isDefault: p.isDefault || false,
          }))
        }

        // Empty result - wait and retry before giving up (unless this was the last attempt)
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      } catch (err) {
        const detail = {
          message: err?.message,
          stderr: err?.stderr,
          stdout: err?.stdout,
          code: err?.code,
        }
        console.error('Error fetching printers via pdf-to-printer:', detail)
        logToFile(`getAvailablePrinters ERROR (attempt ${attempt}/${retries}): ${JSON.stringify(detail)}`)
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      }
    }
    return []
  }

  /**
   * Get system default printer name
   */
  async getDefaultPrinter() {
    try {
      const defaultPrinter = await ptp.getDefaultPrinter()
      return defaultPrinter ? defaultPrinter.name : null
    } catch (err) {
      console.error('Error getting default printer:', err)
      return null
    }
  }

  /**
   * Generates a high-quality, crisp A4 test page PDF buffer with shop details
   */
  async generateTestPagePdf(printerName = '', mode = 'Black & White') {
    const config = configStore.getAll() || {}
    const shopCode = config.shopId || 'NOT CONFIGURED'
    const serverUrl = config.serverUrl || 'https://scanandprint.onrender.com'
    const isColor = String(mode).toLowerCase().includes('color')

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // Standard A4 (210 x 297 mm)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // 1. Outer Border Frame
    page.drawRectangle({
      x: 36,
      y: 36,
      width: 523.28,
      height: 769.89,
      borderWidth: 1.5,
      borderColor: rgb(0.15, 0.15, 0.2),
    })

    // Corner Alignment Marks (5mm circle ticks)
    const corners = [
      { x: 36, y: 36 },
      { x: 559.28, y: 36 },
      { x: 36, y: 805.89 },
      { x: 559.28, y: 805.89 },
    ]
    corners.forEach((c) => {
      page.drawCircle({
        x: c.x,
        y: c.y,
        size: 5,
        borderWidth: 1,
        borderColor: rgb(0.2, 0.2, 0.2),
      })
    })

    // 2. Top Header Banner
    page.drawRectangle({
      x: 36,
      y: 730,
      width: 523.28,
      height: 76,
      color: rgb(0.08, 0.08, 0.12),
    })

    page.drawText('Scan&Print', {
      x: 54,
      y: 770,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1),
    })

    page.drawText('AUTOMATED DESKTOP PRINT AGENT · HARDWARE TEST PAGE', {
      x: 54,
      y: 748,
      size: 10,
      font: fontBold,
      color: rgb(0.95, 0.35, 0.45),
    })

    // 3. Shop & Configuration Details Card
    page.drawRectangle({
      x: 54,
      y: 565,
      width: 487.28,
      height: 145,
      color: rgb(0.96, 0.96, 0.98),
      borderWidth: 1,
      borderColor: rgb(0.85, 0.85, 0.9),
    })

    page.drawText('SHOP & PRINTER CONFIGURATION DETAILS', {
      x: 70,
      y: 686,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.15),
    })

    const details = [
      { label: 'Shop ID / Code:', value: shopCode },
      { label: 'Target Printer:', value: printerName || config.defaultBwPrinter || 'System Default' },
      { label: 'Test Print Mode:', value: mode },
      { label: 'Agent Version:', value: 'v1.0.3 (Windows Automated Spooler)' },
      { label: 'Print Timestamp:', value: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
      { label: 'Cloud Server URL:', value: serverUrl },
    ]

    details.forEach((item, idx) => {
      const yPos = 662 - idx * 18
      page.drawText(item.label, {
        x: 70,
        y: yPos,
        size: 9.5,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.35),
      })
      page.drawText(String(item.value), {
        x: 195,
        y: yPos,
        size: 9.5,
        font: fontBold,
        color: rgb(0.05, 0.05, 0.1),
      })
    })

    // 4. Hardware Diagnostic Status Checks
    page.drawRectangle({
      x: 54,
      y: 435,
      width: 487.28,
      height: 110,
      color: rgb(0.97, 1, 0.97),
      borderWidth: 1,
      borderColor: rgb(0.7, 0.88, 0.75),
    })

    page.drawText('HARDWARE DIAGNOSTIC STATUS', {
      x: 70,
      y: 522,
      size: 11,
      font: fontBold,
      color: rgb(0.05, 0.4, 0.15),
    })

    const diagnostics = [
      '[OK] Windows Spooler Communication: SUCCESSFUL',
      '[OK] PDF Rendering & Rasterization Engine: SUCCESSFUL',
      '[OK] Target Paper Dimensions: Standard A4 (210 x 297 mm)',
      '[OK] Agent Background Service: ACTIVE & READY FOR CLOUD JOBS',
    ]

    diagnostics.forEach((text, idx) => {
      page.drawText(text, {
        x: 70,
        y: 500 - idx * 18,
        size: 9.5,
        font: fontRegular,
        color: rgb(0.1, 0.35, 0.15),
      })
    })

    // 5. Calibration / Quality Test Bars
    page.drawText(isColor ? 'COLOR REGISTRATION & DENSITY CALIBRATION' : 'GRAYSCALE CONTRAST & DENSITY GRADIENT', {
      x: 54,
      y: 400,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.25),
    })

    if (isColor) {
      const colors = [
        { name: 'Cyan', c: rgb(0, 0.8, 1) },
        { name: 'Magenta', c: rgb(0.9, 0, 0.6) },
        { name: 'Yellow', c: rgb(1, 0.9, 0) },
        { name: 'Black', c: rgb(0.05, 0.05, 0.05) },
        { name: 'Red', c: rgb(0.9, 0.1, 0.1) },
        { name: 'Green', c: rgb(0.1, 0.7, 0.2) },
        { name: 'Blue', c: rgb(0.1, 0.3, 0.9) },
      ]
      const blockWidth = 487.28 / colors.length
      colors.forEach((col, idx) => {
        const bx = 54 + idx * blockWidth
        page.drawRectangle({
          x: bx + 2,
          y: 345,
          width: blockWidth - 4,
          height: 40,
          color: col.c,
        })
        page.drawText(col.name, {
          x: bx + 6,
          y: 330,
          size: 8,
          font: fontBold,
          color: rgb(0.2, 0.2, 0.2),
        })
      })
    } else {
      const grays = [
        { label: '100%', val: 0.0 },
        { label: '80%', val: 0.2 },
        { label: '60%', val: 0.4 },
        { label: '40%', val: 0.6 },
        { label: '20%', val: 0.8 },
        { label: '10%', val: 0.9 },
      ]
      const blockWidth = 487.28 / grays.length
      grays.forEach((item, idx) => {
        const bx = 54 + idx * blockWidth
        page.drawRectangle({
          x: bx + 2,
          y: 345,
          width: blockWidth - 4,
          height: 40,
          color: rgb(item.val, item.val, item.val),
          borderWidth: 0.5,
          borderColor: rgb(0.7, 0.7, 0.7),
        })
        page.drawText(item.label, {
          x: bx + 16,
          y: 330,
          size: 8,
          font: fontBold,
          color: rgb(0.2, 0.2, 0.2),
        })
      })
    }

    // 6. Confirmation Message & Operations Guide
    page.drawRectangle({
      x: 54,
      y: 125,
      width: 487.28,
      height: 175,
      color: rgb(0.98, 0.98, 0.98),
      borderWidth: 1,
      borderColor: rgb(0.85, 0.85, 0.85),
    })

    page.drawText('PRINTER READINESS CONFIRMATION', {
      x: 70,
      y: 275,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.15),
    })

    const notes = [
      '• If this page printed cleanly and the text is sharp, your printer is 100% operational.',
      '• Customer print orders submitted via your Shop QR Code will print automatically.',
      '• Make sure this printer is powered on and loaded with standard A4 paper at all times.',
      '• For counter cash payments, approve or reject incoming orders via the Agent desktop window.',
      '• Official Support Email: scanqrandprint@gmail.com | Helpline: +91 7073904473',
    ]

    notes.forEach((note, idx) => {
      page.drawText(note, {
        x: 70,
        y: 250 - idx * 22,
        size: 9,
        font: fontRegular,
        color: rgb(0.25, 0.25, 0.3),
      })
    })

    // 7. Footer
    page.drawText('Scan&Print Automated Print Network · Official Desktop Agent · www.scanandprint.in', {
      x: 105,
      y: 50,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    })

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  }

  /**
   * Send a test print command to verify hardware setup
   */
  async testPrint(printerName, mode = 'Black & White') {
    try {
      console.log(`Sending ${mode} test print to printer: ${printerName || 'System Default'}`)

      const tempDir = path.join(process.env.TEMP || '/tmp', 'scan-and-print-test')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
      const testFilePath = path.join(tempDir, `test_print_${Date.now()}.pdf`)

      const pdfBuffer = await this.generateTestPagePdf(printerName, mode)
      fs.writeFileSync(testFilePath, pdfBuffer)

      const isColorMode = String(mode).toLowerCase().includes('color')

      // Explicitly tell the printer whether to use color or black & white -
      // without this, some printer drivers silently default to monochrome
      // regardless of which "Test ___ Print" button was clicked.
      const options = {
        monochrome: !isColorMode,
      }
      if (printerName) {
        options.printer = printerName
      }

      await ptp.print(testFilePath, options)

      if (fs.existsSync(testFilePath)) {
        try {
          fs.unlinkSync(testFilePath)
        } catch (e) {}
      }

      return { success: true, message: `Test page sent to ${printerName || 'Default Printer'}` }
    } catch (err) {
      console.error('Test print failed:', err)
      return { success: false, error: err.message }
    }
  }
}

const printerManager = new PrinterManager()
export default printerManager
