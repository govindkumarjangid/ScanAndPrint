import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { SITE_CONFIG, SEO_ROUTES } from '../src/data/seoConfig.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const distDir = path.resolve(projectRoot, 'dist')
const publicDir = path.resolve(projectRoot, 'public')

if (!fs.existsSync(distDir)) {
  console.error('❌ [SEO Generator]: dist directory not found! Run "vite build" first.')
  process.exit(1)
}

const baseHtmlPath = path.resolve(distDir, 'index.html')
if (!fs.existsSync(baseHtmlPath)) {
  console.error('❌ [SEO Generator]: dist/index.html not found!')
  process.exit(1)
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8')

console.log('🚀 [SEO Generator]: Starting static route prerendering & SEO injection...')

/**
 * Extract Vite module scripts and stylesheet links from base HTML
 */
const scriptMatches = baseHtml.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || []
const linkPreloads = baseHtml.match(/<link\b[^>]*rel=["'](?:modulepreload|stylesheet)["'][^>]*>/gi) || []
const viteAssets = [...linkPreloads, ...scriptMatches].join('\n  ')

// Extract the <body> element contents (the root div and any bootstrap scripts)
const bodyMatch = baseHtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)
const bodyContent = bodyMatch ? bodyMatch[1].trim() : '<div id="root"></div>'

/**
 * Generate baked HTML for each route
 */
Object.entries(SEO_ROUTES).forEach(([routePath, config]) => {
  let targetFile
  let targetDir

  if (routePath === '/') {
    targetFile = path.resolve(distDir, 'index.html')
    targetDir = distDir
  } else {
    const cleanPath = routePath.replace(/^\/+/, '')
    targetDir = path.resolve(distDir, cleanPath)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    targetFile = path.resolve(targetDir, 'index.html')
  }

  const jsonLdData = config.schemas.length === 1 ? config.schemas[0] : config.schemas

  const fullHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
  <link rel="icon" type="image/svg+xml" href="/svgs/logo.svg" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="${SITE_CONFIG.themeColor}" />
  
  <!-- High-Performance Font Optimization: Preconnect, DNS Prefetch & Non-Blocking Async Loading -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
  <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
  <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
  <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" media="print" onload="this.media='all'" />
  <noscript>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" />
  </noscript>

  <title>${escapeHtml(config.title)}</title>
  <meta name="description" content="${escapeHtml(config.description)}" />
  <meta name="keywords" content="${escapeHtml(config.keywords)}" />
  <link rel="canonical" href="${config.canonical}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

  <!-- Open Graph / Facebook / WhatsApp / Telegram / iMessage -->
  <meta property="og:type" content="${config.ogType || 'website'}" />
  <meta property="og:site_name" content="${SITE_CONFIG.siteName}" />
  <meta property="og:url" content="${config.canonical}" />
  <meta property="og:title" content="${escapeHtml(config.title)}" />
  <meta property="og:description" content="${escapeHtml(config.description)}" />
  <meta property="og:image" content="${config.ogImage}" />
  <meta property="og:image:secure_url" content="${config.ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="1200" />
  <meta property="og:image:alt" content="${escapeHtml(config.title)}" />
  <meta property="og:locale" content="${SITE_CONFIG.locale}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="${SITE_CONFIG.twitterHandle}" />
  <meta name="twitter:creator" content="${SITE_CONFIG.twitterHandle}" />
  <meta name="twitter:url" content="${config.canonical}" />
  <meta name="twitter:title" content="${escapeHtml(config.title)}" />
  <meta name="twitter:description" content="${escapeHtml(config.description)}" />
  <meta name="twitter:image" content="${config.ogImage}" />
  <meta name="twitter:image:alt" content="${escapeHtml(config.title)}" />

  <!-- Structured Data JSON-LD Schema -->
  <script type="application/ld+json">
${JSON.stringify(jsonLdData, null, 2)}
  </script>

  <!-- Bundled Vite Assets -->
  ${viteAssets}
</head>
<body>
  <noscript>
    <div style="padding: 2rem; font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; line-height: 1.6;">
      <h1>${escapeHtml(config.h1 || config.title)}</h1>
      <p>${escapeHtml(config.description)}</p>
      <p><a href="${SITE_CONFIG.domain}">Visit ${SITE_CONFIG.siteName} Home</a></p>
    </div>
  </noscript>
  ${bodyContent}
</body>
</html>`

  fs.writeFileSync(targetFile, fullHtml, 'utf-8')
  console.log(`  ✓ Generated static HTML for: ${routePath} -> ${path.relative(projectRoot, targetFile)}`)
})

/**
 * Generate Sitemap.xml
 */
const todayIso = new Date().toISOString().split('T')[0]
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`

Object.entries(SEO_ROUTES).forEach(([routePath, config]) => {
  sitemapXml += `  <url>
    <loc>${config.canonical}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>${config.changefreq || 'weekly'}</changefreq>
    <priority>${config.priority || '0.7'}</priority>
  </url>
`
})

sitemapXml += `</urlset>`

fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemapXml, 'utf-8')
fs.writeFileSync(path.resolve(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8')
console.log(`  ✓ Generated sitemap.xml with ${Object.keys(SEO_ROUTES).length} landing routes`)

/**
 * Generate Robots.txt
 */
const robotsTxt = `# Scan&Print Production Robots Configuration
User-agent: *
Allow: /

# Disallow private dashboards, admin portals, and kiosk active upload sessions
Disallow: /owner/
Disallow: /admin/
Disallow: /admin-login
Disallow: /p/
Disallow: /kiosk/

# Reference canonical sitemap
Sitemap: ${SITE_CONFIG.domain}/sitemap.xml
`

fs.writeFileSync(path.resolve(distDir, 'robots.txt'), robotsTxt, 'utf-8')
fs.writeFileSync(path.resolve(publicDir, 'robots.txt'), robotsTxt, 'utf-8')
console.log('  ✓ Generated robots.txt')

console.log('🎉 [SEO Generator]: Prerendering & SEO generation completed successfully!')

function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
