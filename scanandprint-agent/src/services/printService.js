import axios from 'axios'
import path from 'path'
import fs from 'fs'
import ptp from 'pdf-to-printer'
import configStore from '../store/configStore.js'
import { ensurePdfBuffer } from '../utils/pdfConverter.js'
import printerManager from './printerManager.js'

const VALID_DUPLEX_SIDES = ['duplex', 'duplexshort', 'duplexlong', 'simplex']

function resolveMonochrome(jobData) {
  const colorType = String(jobData?.colorType || '').toUpperCase().trim()
  return colorType !== 'COLOR'
}

function resolveDuplexSide(jobData) {
  // Explicit side/duplex-mode string, e.g. 'duplex', 'duplexshort', 'duplexlong', 'simplex'.
  const explicitSide = String(
    jobData?.side || jobData?.duplexMode || jobData?.printSide || ''
  ).toLowerCase().trim()

  if (VALID_DUPLEX_SIDES.includes(explicitSide))
    return explicitSide

  // Boolean-style flags used by the customer web app / backend for "print on both sides".
  const isDuplexRequested =
    jobData?.duplex === true ||
    jobData?.isDuplex === true ||
    jobData?.doubleSided === true ||
    jobData?.printSides === 'DOUBLE' ||
    jobData?.printSides === 'double' ||
    jobData?.sides === 'double'

  if (isDuplexRequested) return 'duplex';

  return 'simplex'
}

class PrintService {
  
  constructor() {
    this.tempDir = path.join(process.env.TEMP || '/tmp', 'scan-and-print-jobs')
    this.ensureTempDir()
  }

  ensureTempDir() {
    try {
      if (!fs.existsSync(this.tempDir))
        fs.mkdirSync(this.tempDir, { recursive: true })
    } catch (err) {
      console.error('Error creating temp directory:', err)
    }
  }

  async executePrintJob(jobData) {
    const { jobId, fileUrl, downloadUrl, colorType, copies = 1, targetPrinterName } = jobData
    console.log(`[PrintService] 🖨️ Processing Job #${jobId}...`, {
      colorType,
      copies,
      duplexRequested: Boolean(resolveDuplexSide(jobData)),
      fileUrl: fileUrl?.slice?.(0, 40),
    })

    const tempFilePath = path.join(this.tempDir, `job_${jobId}_${Date.now()}.pdf`)

    try {
      let fileBuffer = null

      // Case 1: Base64 data string
      if (fileUrl && fileUrl.startsWith('data:')) {
        console.log(`[PrintService] Decoding Base64 file payload for #${jobId}...`)
        const base64Data = fileUrl.replace(/^data:[^;]+;base64,/, '')
        fileBuffer = Buffer.from(base64Data, 'base64')
      } else {
        // Case 2: Download from remote URLs (Cloudinary, Backend Proxy, or downloadUrl)
        const serverUrl = configStore.get('serverUrl') || 'https://scanandprint.onrender.com'
        const candidateUrls = []

        // Remote & fallback URLs
        if (downloadUrl) {
          if (downloadUrl.startsWith('http')) {
            candidateUrls.push(downloadUrl)
          } else {
            candidateUrls.push(`${serverUrl.replace(/\/+$/, '')}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`)
            candidateUrls.push(`https://scanandprint.onrender.com${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`)
          }
        }
        if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
          candidateUrls.push(fileUrl)
        }
        candidateUrls.push(`${serverUrl.replace(/\/+$/, '')}/api/kiosk/download/${jobId}`)
        candidateUrls.push(`https://scanandprint.onrender.com/api/kiosk/download/${jobId}`)

        for (const targetUrl of candidateUrls) {
          try {
            console.log(`[PrintService] Attempting file download from: ${targetUrl}`)
            const response = await axios({
              method: 'GET',
              url: targetUrl,
              responseType: 'arraybuffer',
              timeout: 15000,
              maxRedirects: 5,
            })

            if (response.status === 200 && response.data && response.data.byteLength > 0) {
              const buf = Buffer.from(response.data)
              if (buf.length > 10) {
                fileBuffer = buf
                console.log(`[PrintService] ✅ Downloaded document (${fileBuffer.length} bytes) from: ${targetUrl}`)
                break
              }
            }
          } catch (dlErr) {
            // Try next candidate URL
          }
        }
      }

      if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error(`Could not download a valid document file for Job #${jobId}`)
      }

      // Convert any image (PNG, JPG, etc.) to valid A4 printable PDF
      fileBuffer = await ensurePdfBuffer(fileBuffer, jobData.originalFileName || `${jobId}.pdf`)

      fs.writeFileSync(tempFilePath, fileBuffer)
      console.log(`[PrintService] Saved local print file: ${tempFilePath} (${fileBuffer.length} bytes)`)

      // Determine Target Printer (B&W vs Color or Explicit target)
      const config = configStore.getAll()
      let selectedPrinter = targetPrinterName

      if (!selectedPrinter) {
        if (colorType === 'COLOR' && config.defaultColorPrinter) {
          selectedPrinter = config.defaultColorPrinter
        } else if (config.defaultBwPrinter) {
          selectedPrinter = config.defaultBwPrinter
        }
      }

      // Auto-detect physical printer ONLY when we still don't know which printer
      // to use. Calling getAvailablePrinters() shells out to Windows PowerShell/WMI,
      // which typically costs 1-3+ seconds. Skipping it whenever targetPrinterName
      // or a configured default printer is already known makes every normal job
      // print near-instantly instead of paying this cost on every single job.
      if (!selectedPrinter || selectedPrinter === 'Microsoft Print to PDF') {
        try {
          const availablePrinters = await printerManager.getAvailablePrinters(2, 1000)
          const physical = availablePrinters.find(
            (p) =>
              !p.name.includes('Print to PDF') &&
              !p.name.includes('OneNote') &&
              !p.name.includes('XPS') &&
              !p.name.includes('Fax')
          )
          if (physical) {
            selectedPrinter = physical.name
            console.log(`[PrintService] Auto-selected hardware printer: ${selectedPrinter}`)
          } else if (availablePrinters.length > 0) {
            selectedPrinter = availablePrinters[0].name
          }
          if (!selectedPrinter) {
            try {
              const defP = await ptp.getDefaultPrinter()
              if (defP) selectedPrinter = defP
            } catch (e) { }
          }
        } catch (pErr) { }
      }

      // Resolve color and duplex ("both sides") settings from the incoming job data.
      const monochrome = resolveMonochrome(jobData)
      const duplexSide = resolveDuplexSide(jobData)

      console.log(
        `[PrintService] Sending silent print job to printer: ${selectedPrinter || 'System Default'} ` +
        `(color: ${monochrome ? 'B&W' : 'COLOR'}, side: ${duplexSide})`
      )

      // Execute Silent Hardware Print via pdf-to-printer (Requires explicit printer name for 0 GUI dialog)
      const printOptions = {
        copies: Number(copies) || 1,
        silent: true,
        monochrome,
        side: duplexSide, // always explicit ('duplex...' or 'simplex') - see resolveDuplexSide()
      }

      if (jobData?.paperSize) {
        printOptions.paperSize = jobData.paperSize
      }

      if (selectedPrinter) {
        printOptions.printer = selectedPrinter
      }

      try {
        if (selectedPrinter) {
          await ptp.print(tempFilePath, printOptions)
          console.log(`[PrintService] ✅ Silent hardware print executed successfully for Job #${jobId}`)
        } else {
          // If no printer detected, use silent PowerShell spooler instead of opening Sumatra GUI.
          // NOTE: the PowerShell fallback below uses the printer's OS-level default settings and
          // cannot force color/duplex options - those only apply on the pdf-to-printer path above.
          console.warn(
            '[PrintService] ⚠️ No target printer resolved - falling back to OS default print verb. ' +
            'Color/duplex options requested for this job will NOT be applied via this fallback path.'
          )
          await this.fallbackWindowsPrint(tempFilePath, null)
        }
      } catch (printErr) {
        console.warn(`[PrintService] Silent print note (${printErr.message}), trying fallback...`)
        console.warn(
          '[PrintService] ⚠️ Fallback path cannot apply color/duplex options for this job.'
        )
        await this.fallbackWindowsPrint(tempFilePath, selectedPrinter)
      }

      // Auto-Purge File Immediately for Privacy - but wait long enough for the
      // print spooler to have actually finished reading the file first. A fixed
      // 3s delay is too short for large multi-page PDFs or slow USB/network
      // printers, which can cause a corrupted/incomplete print. Scale the delay
      // with file size (roughly 1s per MB) with a safe minimum and maximum.
      const fileSizeMb = fileBuffer.length / (1024 * 1024)
      const purgeDelayMs = Math.min(Math.max(5000, fileSizeMb * 1000), 20000)
      setTimeout(() => this.purgeFile(tempFilePath), purgeDelayMs)

      return {
        success: true,
        jobId,
        printedOn: selectedPrinter || 'Default Printer',
        timestamp: new Date().toISOString(),
      }
    } catch (err) {
      console.error(`[PrintService] Failed to print Job #${jobId}:`, err.message)
      this.purgeFile(tempFilePath)
      throw new Error(`Print execution failed: ${err.message}`)
    }
  }

  /**
   * Windows Native Spooler Fallback
   */
  async fallbackWindowsPrint(filePath, printerName) {
    const { exec } = await import('child_process')
    return new Promise((resolve, reject) => {
      let cmd = ''
      const safePath = filePath.replace(/'/g, "''")
      if (printerName) {
        const safePrinter = printerName.replace(/'/g, "''")
        cmd = `powershell -Command "Start-Process -FilePath '${safePath}' -Verb PrintTo -ArgumentList '${safePrinter}' -PassThru | Out-Null"`
      } else {
        cmd = `powershell -Command "Start-Process -FilePath '${safePath}' -Verb Print -PassThru | Out-Null"`
      }
      exec(cmd, { timeout: 15000 }, (error) => {
        if (error) {
          console.error('[PrintService] Windows fallback print error:', error.message)
          reject(error)
        } else {
          console.log('[PrintService] ✅ Windows fallback print queued in Spooler')
          resolve(true)
        }
      })
    })
  }

  /**
   * Immediately purge downloaded temporary file from disk
   */
  purgeFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`[PrintService] Auto-purged temp file: ${filePath}`)
      }
    } catch (err) {
      console.error(`[PrintService] Failed to purge temp file ${filePath}:`, err)
    }
  }
}

const printService = new PrintService()
export default printService
