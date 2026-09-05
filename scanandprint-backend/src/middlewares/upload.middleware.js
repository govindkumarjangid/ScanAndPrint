import multer from 'multer'

const storage = multer.memoryStorage()

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const ALLOWED_EXTENSIONS = /\.(pdf|jpe?g|png|webp|docx?)$/i

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB Large document support
  },
  fileFilter: (req, file, cb) => {
    const isMimeAllowed = ALLOWED_MIME_TYPES.has(file.mimetype)
    const isExtAllowed = ALLOWED_EXTENSIONS.test(file.originalname)

    if (isMimeAllowed || isExtAllowed) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file format (${file.mimetype}). Only PDF, Word Documents, and Images are allowed.`), false)
    }
  },
})

export default upload;