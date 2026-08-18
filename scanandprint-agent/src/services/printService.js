import axios from 'axios'
import path from 'path'
import fs from 'fs'
import ptp from 'pdf-to-printer'
import configStore from '../store/configStore.js'
import { ensurePdfBuffer } from '../utils/pdfConverter.js'
import printerManager from './printerManager.js'

class PrintService {
  constructor() {
    this.tempDir = path.join(process.env.TEMP || '/tmp', 'qr-printpe-jobs')
    this.ensureTempDir()
  }

  ensureTempDir() {
    try {
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true })
      }
    } catch (err) {
      console.error('Error creating temp directory:', err)
    }
  }

  /**
   * Execute silent print job downloaded from Cloud Server / Storage
   * @param {Object} jobData - { jobId, fileUrl, downloadUrl, colorType, copies, pages, targetPrinterName }
   */
  async executePrintJob(jobData) {
    const { jobId, fileUrl, downloadUrl, colorType, copies = 1, targetPrinterName } = jobData
    console.log(`[PrintService] 🖨️ Processing Job #${jobId}...`, { colorType, copies, fileUrl: fileUrl?.slice?.(0, 40) })

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

        // Local & Remote fallback URLs
        if (downloadUrl) {
          if (downloadUrl.startsWith('http')) {
            candidateUrls.push(downloadUrl)
          } else {
            candidateUrls.push(`${serverUrl.replace(/\/+$/, '')}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`)
            candidateUrls.push(`http://localhost:5000${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`)
            candidateUrls.push(`http://127.0.0.1:5000${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`)
          }
        }
        if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
          candidateUrls.push(fileUrl)
        }
        candidateUrls.push(`${serverUrl.replace(/\/+$/, '')}/api/kiosk/download/${jobId}`)
        candidateUrls.push(`http://localhost:5000/api/kiosk/download/${jobId}`)
        candidateUrls.push(`http://127.0.0.1:5000/api/kiosk/download/${jobId}`)

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

      // Auto-detect physical printer if virtual driver is selected
      try {
        const availablePrinters = await printerManager.getAvailablePrinters(2, 1000)
        if (!selectedPrinter || selectedPrinter === 'Microsoft Print to PDF') {
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
          }
        }
      } catch (pErr) {}

      console.log(`[PrintService] Sending silent print job to printer: ${selectedPrinter || 'System Default'}`)

      // Execute Silent Hardware Print via pdf-to-printer
      const printOptions = {
        copies: Number(copies) || 1,
      }

      if (selectedPrinter) {
        printOptions.printer = selectedPrinter
      }

      try {
        await ptp.print(tempFilePath, printOptions)
        console.log(`[PrintService] ✅ Hardware print executed successfully via SumatraPDF for Job #${jobId}`)
      } catch (printErr) {
        console.warn(`[PrintService] pdf-to-printer error (${printErr.message}), executing Windows PowerShell Spooler fallback...`)
        await this.fallbackWindowsPrint(tempFilePath, selectedPrinter)
      }

      // Auto-Purge File Immediately for 100% Privacy
      setTimeout(() => this.purgeFile(tempFilePath), 3000)

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
