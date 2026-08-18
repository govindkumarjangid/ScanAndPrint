import ptp from 'pdf-to-printer'
import path from 'path'
import fs from 'fs'

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

class PrinterManager {
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
   * Send a test print command to verify hardware setup
   */
  async testPrint(printerName) {
    try {
      console.log(`Sending test print to printer: ${printerName || 'System Default'}`)

      const tempDir = path.join(process.env.TEMP || '/tmp', 'scan-and-print-test')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
      const testFilePath = path.join(tempDir, 'test_print.pdf')

      const pdfBuffer = Buffer.from(
        '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF'
      )
      fs.writeFileSync(testFilePath, pdfBuffer)

      const options = {}
      if (printerName) {
        options.printer = printerName
      }

      await ptp.print(testFilePath, options)

      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath)
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
