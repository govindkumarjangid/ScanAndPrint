import axios from 'axios'
import path from 'path'
import fs from 'fs'
import ptp from 'pdf-to-printer'
import configStore from '../store/configStore.js'
import { ensurePdfBuffer } from '../utils/pdfConverter.js'

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
    console.log(`[PrintService] Processing Job #${jobId}...`, { colorType, copies, fileUrl })

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
        const serverUrl = configStore.get('serverUrl') || 'http://localhost:5000'
        const candidateUrls = []

        if (downloadUrl) {
          candidateUrls.push(
            downloadUrl.startsWith('http')
              ? downloadUrl
              : `${serverUrl.replace(/\/+$/, '')}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`
          )
        }
        if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
          candidateUrls.push(fileUrl)
        }
        candidateUrls.push(`${serverUrl.replace(/\/+$/, '')}/api/kiosk/download/${jobId}`)

        for (const targetUrl of candidateUrls) {
          try {
            console.log(`[PrintService] Attempting file download from: ${targetUrl}`)
            const response = await axios({
              method: 'GET',
              url: targetUrl,
              responseType: 'arraybuffer',
              timeout: 25000,
              maxRedirects: 5,
            })

            if (response.status === 200 && response.data && response.data.byteLength > 0) {
              const buf = Buffer.from(response.data)
              // Verify PDF signature (%PDF) or valid binary buffer
              if (buf.length > 10 && buf.toString('utf8', 0, 4) === '%PDF') {
                fileBuffer = buf
                console.log(`[PrintService] Successfully verified & downloaded PDF (${fileBuffer.length} bytes) from: ${targetUrl}`)
                break
              } else if (buf.length > 50) {
                fileBuffer = buf
                console.log(`[PrintService] Downloaded document file (${fileBuffer.length} bytes) from: ${targetUrl}`)
                break
              }
            }
          } catch (dlErr) {
            console.warn(`[PrintService] Download attempt failed for ${targetUrl}:`, dlErr.message)
          }
        }
      }

      if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error(`Could not download a valid document file for Job #${jobId}`)
      }

      // Convert any image (PNG, JPG, etc.) to valid A4 printable PDF
      fileBuffer = await ensurePdfBuffer(fileBuffer, jobData.originalFileName || `${jobId}.pdf`)

      fs.writeFileSync(tempFilePath, fileBuffer)
      console.log(`[PrintService] Saved verified local print file: ${tempFilePath} (${fileBuffer.length} bytes)`)

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

      console.log(`[PrintService] Sending silent print job to printer: ${selectedPrinter || 'System Default'}`)

      // Execute Silent Hardware Print via pdf-to-printer
      const printOptions = {
        copies: Number(copies) || 1,
      }

      if (selectedPrinter) {
        printOptions.printer = selectedPrinter
      }

      await ptp.print(tempFilePath, printOptions)

      console.log(`[PrintService] Hardware print executed successfully for Job #${jobId}`)

      // Auto-Purge File Immediately for 100% Privacy
      this.purgeFile(tempFilePath)

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
