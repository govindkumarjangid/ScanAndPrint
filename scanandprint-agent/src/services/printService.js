import axios from 'axios'
import path from 'path'
import fs from 'fs'
import ptp from 'pdf-to-printer'
import configStore from '../store/configStore.js'

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
   * Execute silent print job downloaded from Cloud Server
   * @param {Object} jobData - { jobId, fileUrl, colorType, copies, pages, targetPrinterName }
   */
  async executePrintJob(jobData) {
    const { jobId, fileUrl, colorType, copies = 1, targetPrinterName } = jobData
    console.log(`[PrintService] Processing Job #${jobId}...`, { colorType, copies })

    const tempFilePath = path.join(this.tempDir, `job_${jobId}_${Date.now()}.pdf`)

    try {
      // Step 1: Download PDF File from Cloud Storage / Server URL
      console.log(`[PrintService] Downloading file from: ${fileUrl}`)
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'arraybuffer',
        timeout: 30000,
      })

      fs.writeFileSync(tempFilePath, Buffer.from(response.data))
      console.log(`[PrintService] Temp file saved: ${tempFilePath}`)

      // Step 2: Determine Target Printer (B&W vs Color or Explicit target)
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

      // Step 3: Execute Silent Hardware Print via pdf-to-printer
      const printOptions = {
        copies: Number(copies) || 1,
      }

      if (selectedPrinter) {
        printOptions.printer = selectedPrinter
      }

      await ptp.print(tempFilePath, printOptions)

      console.log(`[PrintService] Hardware print executed successfully for Job #${jobId}`)

      // Step 4: Auto-Purge File Immediately for 100% Privacy
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
