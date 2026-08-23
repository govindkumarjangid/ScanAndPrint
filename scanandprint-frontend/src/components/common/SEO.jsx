import { Helmet } from 'react-helmet-async'
import { SITE_CONFIG, SEO_ROUTES } from '../../data/seoConfig'

/**
 * Reusable SEO Component for React Helmet Async.
 * Automatically synchronizes document head with route configuration.
 *
 * @param {Object} props
 * @param {string} [props.path] - Route path matching SEO_ROUTES (e.g., '/pricing')
 * @param {string} [props.title] - Custom title override
 * @param {string} [props.description] - Custom description override
 * @param {string} [props.canonicalUrl] - Custom canonical URL override
 * @param {string} [props.ogImage] - Custom Open Graph image URL
 * @param {string} [props.ogType] - Custom og:type ('website', 'article', etc.)
 * @param {Array}  [props.schemas] - Array of JSON-LD schema objects
 * @param {boolean} [props.noIndex] - If true, injects noindex, nofollow
 */
export default function SEO({
  path,
  title: customTitle,
  description: customDescription,
  canonicalUrl: customCanonical,
  ogImage: customOgImage,
  ogType: customOgType,
  schemas: customSchemas,
  noIndex = false,
}) {
  const routeData = path && SEO_ROUTES[path] ? SEO_ROUTES[path] : null

  const title = customTitle || routeData?.title || `${SITE_CONFIG.siteName} – Smart Automated QR Printing`
  const description =
    customDescription ||
    routeData?.description ||
    'Customers scan counter QR code, upload documents, pay via UPI, and print directly to any desktop printer in 2 minutes.'
  const canonical = customCanonical || routeData?.canonical || (path ? `${SITE_CONFIG.domain}${path}` : SITE_CONFIG.domain)
  const ogImage = customOgImage || routeData?.ogImage || SITE_CONFIG.defaultOgImage
  const ogType = customOgType || routeData?.ogType || 'website'
  const keywords = routeData?.keywords || 'scan and print, qr printing, cyber cafe print software'
  const schemas = customSchemas || routeData?.schemas || []

  return (
    <Helmet>
      {/* Basic Primary Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      <meta name="theme-color" content={SITE_CONFIG.themeColor} />

      {/* Robots Indexing */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph Tags (Facebook, WhatsApp, Telegram, LinkedIn, iMessage) */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_CONFIG.siteName} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="1200" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />

      {/* Twitter / X Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:creator" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* JSON-LD Structured Data Schemas */}
      {schemas && schemas.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(schemas.length === 1 ? schemas[0] : schemas)}
        </script>
      )}
    </Helmet>
  )
}
