import fs from 'fs'
import path from 'path'

export const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'WhatsApp',
  'Twitterbot',
  'TelegramBot',
  'LinkedInBot',
  'Slackbot',
  'Slack-ImgProxy',
  'Discordbot',
  'Applebot',
  'Pinterest',
  'Pinterestbot',
  'SkypeUriPreview',
  'redditbot',
  'Googlebot',
  'Google-InspectionTool',
  'bingbot',
  'adidxbot',
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  'coccocbot',
  'vkShare',
  'W3C_Validator',
  'Embedly',
  'Quora Link Preview',
  'Yahoo! Slurp',
]

export const CRAWLER_REGEX = new RegExp(
  CRAWLER_USER_AGENTS.map((agent) => agent.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'),
  'i'
)

/**
 * Checks if incoming request User-Agent matches any known crawler/social preview bot.
 * @param {string} userAgent
 * @returns {boolean}
 */
export function isCrawler(userAgent) {
  if (!userAgent) return false
  return CRAWLER_REGEX.test(userAgent)
}

/**
 * Express Middleware Example for Bot Interception
 *
 * @param {string} distPath
 */
export function botDetectionMiddleware(distPath) {
  return (req, res, next) => {
    const userAgent = req.headers['user-agent'] || ''

    if (isCrawler(userAgent)) {
      // Clean request path
      const reqPath = req.path.replace(/\/+$/, '') || '/'
      const cleanPath = reqPath === '/' ? 'index.html' : path.join(reqPath.replace(/^\/+/, ''), 'index.html')
      const targetHtmlFile = path.resolve(distPath, cleanPath)

      if (fs.existsSync(targetHtmlFile)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('X-Bot-Detection', 'true')
        return res.sendFile(targetHtmlFile)
      }
    }

    return next()
  }
}

