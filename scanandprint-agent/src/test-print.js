import printerManager from './services/printerManager.js'

async function runTest() {
  console.log('========================================')
  console.log('🖨️ Testing Local Windows Printer Query (ES Modules)...')
  console.log('========================================')

  const printers = await printerManager.getAvailablePrinters()
  console.log(`Found ${printers.length} installed printers on this system:`)
  console.table(printers)

  const defaultPrinter = await printerManager.getDefaultPrinter()
  console.log(`System Default Printer: ${defaultPrinter || 'None detected'}`)
  console.log('========================================')
}

runTest()
