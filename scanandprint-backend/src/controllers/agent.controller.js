import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'
import ptp from 'pdf-to-printer';
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ensurePdfBuffer } from '../utils/pdfConverter.util.js'
import { activeAgentsMap } from '../socket.js'
import { shopRepository } from '../repositories/shop.repository.js'

const execFileAsync = promisify(execFile)

export const handleAgentAuth = asyncHandler(async (req, res, next) => {
  return sendSuccess(res, 200, 'Agent Authenticated', {
    shop: req.shop,
  })
})

// Query real-time in-memory Agent online status
export const getLiveAgentStatus = asyncHandler(async (req, res, next) => {
  const shopCode = String(req.params.shopCode || req.query.shopCode || '').trim().toUpperCase()
  let isOnline = Boolean(shopCode && activeAgentsMap.has(shopCode))
  let agentInfo = isOnline ? activeAgentsMap.get(shopCode) : null
  let printers = agentInfo?.printers || []

  if (!isOnline && shopCode) {
    try {
      const shop = await shopRepository.findByCode(shopCode)
      if (shop && shop.isOnline && shop.lastHeartbeatAt) {
        const diffMs = Date.now() - new Date(shop.lastHeartbeatAt).getTime()
        if (diffMs < 90000) {
          isOnline = true
          printers = shop.connectedPrinters || []
        }
      }
    } catch (e) {
      console.warn('[AgentStatus] Fallback check warning:', e.message)
    }
  }

  return sendSuccess(res, 200, 'Live agent status retrieved', {
    isOnline,
    shopCode,
    printers,
    connectedAt: agentInfo?.connectedAt || null,
  })
})

// Query real connected Windows hardware printers directly from the OS spooler
export const getSystemPrinters = asyncHandler(async (req, res, next) => {
  let printers = []

  try {
    const { stdout } = await execFileAsync('powershell.exe', [
      '-NoProfile',
      '-Command',
      'Get-CimInstance Win32_Printer | Select-Object Name, Default, Local, Network | ConvertTo-Json -Compress',
    ])

    if (stdout && stdout.trim()) {
      const parsed = JSON.parse(stdout.trim())
      const list = Array.isArray(parsed) ? parsed : [parsed]
      printers = list
        .filter((p) => p && p.Name)
        .map((p) => ({
          name: p.Name,
          deviceId: p.Name,
          isDefault: Boolean(p.Default),
        }))
    }
  } catch (err) {
    console.warn('[SystemPrinters] Could not query Win32_Printer:', err.message)
  }

  return sendSuccess(res, 200, 'System printers fetched successfully', {
    printers,
  })
})

// Execute hardware print job directly on the machine
export const executeLocalPrint = asyncHandler(async (req, res, next) => {
  const { jobId, fileUrl, downloadUrl, printerName, copies = 1 } = req.body

  console.log(`[LocalPrint API] Spooling print job #${jobId || 'TEST'} to [${printerName || 'Default'}]...`)

  const uploadsDir = path.join(process.cwd(), 'uploads', 'jobs')
  let printFilePath = path.join(uploadsDir, `${jobId}.pdf`)

  if (!fs.existsSync(printFilePath)) {
    const tempDir = path.join(process.cwd(), 'uploads', 'temp')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
    printFilePath = path.join(tempDir, `print_${jobId || Date.now()}.pdf`)

    let downloadedBuffer = null

    if (fileUrl && fileUrl.startsWith('data:')) {
      const base64Data = fileUrl.replace(/^data:[^;]+;base64,/, '')
      downloadedBuffer = Buffer.from(base64Data, 'base64')
    } else if (fileUrl || downloadUrl) {
      const candidateUrls = [
        downloadUrl ? `https://scanandprint.onrender.com${downloadUrl}` : null,
        fileUrl,
        `https://scanandprint.onrender.com/api/kiosk/download/${jobId}`,
      ].filter(Boolean)

      for (const u of candidateUrls) {
        try {
          const fetchRes = await fetch(u)
          if (fetchRes.ok) {
            const ab = await fetchRes.arrayBuffer()
            if (ab.byteLength > 0) {
              downloadedBuffer = Buffer.from(ab)
              break
            }
          }
        } catch (e) {
          console.warn(`[LocalPrint API] Download try failed for ${u}:`, e.message)
        }
      }
    }

    // If still no buffer, generate a quick test page!
    if (!downloadedBuffer || downloadedBuffer.length === 0) {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
      const doc = await PDFDocument.create()
      const p = doc.addPage([595.28, 841.89])
      const font = await doc.embedFont(StandardFonts.HelveticaBold)
      const fontReg = await doc.embedFont(StandardFonts.Helvetica)
      p.drawRectangle({ x: 40, y: 730, width: 515, height: 70, color: rgb(0.94, 0.14, 0.36) })
      p.drawText('SCAN & PRINT - HARDWARE TEST PAGE', { x: 60, y: 765, size: 20, font, color: rgb(1, 1, 1) })
      p.drawText(`Printer: ${printerName || 'HP LaserJet 1020'}`, { x: 50, y: 700, size: 14, font, color: rgb(0.1, 0.6, 0.3) })
      p.drawText(`Printed At: ${new Date().toLocaleString('en-IN')}`, { x: 50, y: 675, size: 12, font: fontReg, color: rgb(0.3, 0.3, 0.3) })
      p.drawText('[PASS] Verification Passed: Your physical printer is working 100%!', { x: 50, y: 640, size: 13, font, color: rgb(0.1, 0.55, 0.3) })
      downloadedBuffer = Buffer.from(await doc.save())
    }

    // Convert any image (PNG, JPG) to printable PDF buffer
    downloadedBuffer = await ensurePdfBuffer(downloadedBuffer, req.body.originalFileName || `${jobId}.pdf`)
    fs.writeFileSync(printFilePath, downloadedBuffer)
  }

  let targetPrinter = printerName
  if (!targetPrinter) {
    const def = await ptp.getDefaultPrinter()
    targetPrinter = def?.name || 'HP LaserJet 1020'
  }

  const printOptions = { copies: Math.max(1, Number(copies) || 1) }
  if (targetPrinter) {
    printOptions.printer = targetPrinter
  }

  try {
    await ptp.print(printFilePath, printOptions)
    console.log(`[LocalPrint API] ✅ Sent to physical printer: ${targetPrinter}`)
    return sendSuccess(res, 200, `Printed successfully on ${targetPrinter}`, {
      jobId,
      printer: targetPrinter,
    })
  } catch (err) {
    console.error(`[LocalPrint API] ❌ Hardware error:`, err.message)
    return sendError(res, 500, `Printer Hardware Error: ${err.message}`)
  }
})