import axios from 'axios'
import path from 'path'
import fs from 'fs'
import ptp from 'pdf-to-printer'
import configStore from '../store/configStore.js'
import { ensurePdfBuffer } from '../utils/pdfConverter.js'
import printerManager from './printerManager.js'

class PrintService {
  constructor() {
    this.tempDir = path.join(process.env.TEMP || '/tmp', 'scan-and-print-jobs')
    this.preFetchedJobs = new Map()
    this.cachedPrinterName = null
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
   * Fast-track fetch document buffer with direct backend stream priority (<80ms)
   */
  async fetchJobBuffer(jobData) {
    const { jobId, fileUrl, downloadUrl } = jobData

    // 1. Base64 payload (0 network latency)
    if (fileUrl && fileUrl.startsWith('data:')) {
      const base64Data = fileUrl.replace(/^data:[^;]+;base64,/, '')
      return Buffer.from(base64Data, 'base64')
    }

    const serverUrl = (configStore.get('serverUrl') || 'https://scanandprint.onrender.com').replace(/\/+$/, '')
    const candidateUrls = []

    // Priority 1: Direct backend local file stream (<80ms over LAN/Broadband)
    candidateUrls.push(`${serverUrl}/api/kiosk/download/${jobId}`)

    // Priority 2: Direct downloadUrl
    if (downloadUrl) {
      if (downloadUrl.startsWith('http')) {
        candidateUrls.push(downloadUrl)
      } else {
        candidateUrls.push(`${serverUrl}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`)
      }
    }

    // Priority 3: Remote Cloudinary or external CDN url
    if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
      candidateUrls.push(fileUrl)
    }

    // Fallback cloud mirror
    candidateUrls.push(`https://scanandprint.onrender.com/api/kiosk/download/${jobId}`)

    for (const targetUrl of candidateUrls) {
      try {
        const response = await axios({
          method: 'GET',
          url: targetUrl,
          responseType: 'arraybuffer',
          timeout: 6000,
          maxRedirects: 3,
        })

        if (response.status === 200 && response.data && response.data.byteLength > 0) {
          const buf = Buffer.from(response.data)
          if (buf.length > 10) {
            return buf
          }
        }
      } catch {
        // Try next candidate in waterfall
      }
    }

    throw new Error(`Could not download a valid document file for Job #${jobId}`)
  }

  /**
   * ⚡ Background Pre-fetcher: Downloads & writes file to disk while popup is opening
   */
  async preFetchJobFile(jobData) {
    const { jobId } = jobData
    if (!jobId) return null
    if (this.preFetchedJobs.has(jobId)) {
      return this.preFetchedJobs.get(jobId)
    }

    const fetchPromise = (async () => {
      try {
        console.log(`[PrintService] ⚡ Background pre-fetching Job #${jobId}...`)
        const tempFilePath = path.join(this.tempDir, `job_${jobId}_${Date.now()}.pdf`)
        let fileBuffer = await this.fetchJobBuffer(jobData)
        fileBuffer = await ensurePdfBuffer(fileBuffer, jobData.originalFileName || `${jobId}.pdf`)
        fs.writeFileSync(tempFilePath, fileBuffer)
        console.log(`[PrintService] ⚡ Pre-fetch complete for Job #${jobId} (${fileBuffer.length} bytes ready on disk)`)
        return tempFilePath
      } catch (err) {
        console.warn(`[PrintService] Pre-fetch failed for Job #${jobId}:`, err.message)
        this.preFetchedJobs.delete(jobId)
        return null
      }
    })()

    this.preFetchedJobs.set(jobId, fetchPromise)
    return fetchPromise
  }

  /**
   * Execute silent print job (instantly if pre-fetched!)
   */
  async executePrintJob(jobData) {
    const { jobId, colorType, copies = 1, targetPrinterName } = jobData
    console.log(`[PrintService] 🖨️ Processing Job #${jobId}...`, { colorType, copies })

    let tempFilePath = null

    try {
      // Check if file was already pre-fetched in background!
      if (this.preFetchedJobs.has(jobId)) {
        try {
          tempFilePath = await this.preFetchedJobs.get(jobId)
          if (tempFilePath && fs.existsSync(tempFilePath)) {
            console.log(`[PrintService] 🚀 Instant Print Cache HIT for Job #${jobId}! (0ms download delay)`)
          } else {
            tempFilePath = null
          }
        } catch {
          tempFilePath = null
        }
      }

      // If not pre-fetched, download now
      if (!tempFilePath) {
        tempFilePath = path.join(this.tempDir, `job_${jobId}_${Date.now()}.pdf`)
        let fileBuffer = await this.fetchJobBuffer(jobData)
        fileBuffer = await ensurePdfBuffer(fileBuffer, jobData.originalFileName || `${jobId}.pdf`)
        fs.writeFileSync(tempFilePath, fileBuffer)
        console.log(`[PrintService] Saved local print file: ${tempFilePath} (${fileBuffer.length} bytes)`)
      }

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

      // High-Speed Printer Resolution: Use cache or quick lookup
      if (!selectedPrinter) {
        if (this.cachedPrinterName) {
          selectedPrinter = this.cachedPrinterName
        } else {
          try {
            const availablePrinters = await printerManager.getAvailablePrinters(1, 300)
            const physical = availablePrinters.find(
              (p) =>
                !p.name.includes('Print to PDF') &&
                !p.name.includes('OneNote') &&
                !p.name.includes('XPS') &&
                !p.name.includes('Fax')
            )
            if (physical) selectedPrinter = physical.name
            else if (availablePrinters.length > 0) selectedPrinter = availablePrinters[0].name

            if (!selectedPrinter) {
              selectedPrinter = await ptp.getDefaultPrinter().catch(() => null)
            }
            if (selectedPrinter) this.cachedPrinterName = selectedPrinter
          } catch {
            // Ignore printer detection errors
          }
        }
      }

      console.log(`[PrintService] Sending silent print job to printer: ${selectedPrinter || 'System Default'}`)

      // Execute Silent Hardware Print via pdf-to-printer
      const printOptions = {
        copies: Number(copies) || 1,
        silent: true,
      }

      if (selectedPrinter) {
        printOptions.printer = selectedPrinter
      }

      try {
        if (selectedPrinter) {
          await ptp.print(tempFilePath, printOptions)
          console.log(`[PrintService] ✅ Silent hardware print executed successfully for Job #${jobId}`)
        } else {
          await this.fallbackWindowsPrint(tempFilePath, null)
        }
      } catch (printErr) {
        console.warn(`[PrintService] Silent print note (${printErr.message}), trying fallback...`)
        await this.fallbackWindowsPrint(tempFilePath, selectedPrinter)
      }

      // Clean prefetch cache
      this.preFetchedJobs.delete(jobId)

      // Auto-Purge File after 3 seconds for 100% privacy
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
