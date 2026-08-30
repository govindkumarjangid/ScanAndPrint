/**
 * Scan&Print - Central SEO Configuration & Metadata Registry
 * Single source of truth for all SEO tags, Open Graph previews, Twitter cards, and JSON-LD schemas.
 */

export const SITE_CONFIG = {
  siteName: 'Scan&Print',
  domain: 'https://scanandprint.in',
  defaultOgImage: 'https://scanandprint.in/images/og/og-home.png',
  logoUrl: 'https://scanandprint.in/svgs/logo.svg',
  faviconUrl: 'https://scanandprint.in/svgs/logo.svg',
  themeColor: '#0c0a09',
  brandColor: '#e11d48',
  locale: 'en_IN',
  twitterHandle: '@scanandprint_in',
  contactEmail: 'scanqrandprint@gmail.com',
  contactPhone: '+91 7073904473',
  country: 'India',
  socialLinks: {
    youtube: 'https://www.youtube.com/@scanandprint',
    facebook: 'https://www.facebook.com/scanandprint.in',
    instagram: 'https://www.instagram.com/scanandprint.in/',
  },
}

export const SEO_ROUTES = {
  '/': {
    title: 'Scan & Print – Scan QR and Print Documents Automatically | Smart Kiosk',
    description:
      'Scan and Print automatically! Customers scan your shop QR code, upload documents, pay via UPI, and automatically print directly to your desktop printers in seconds. Zero WhatsApp queues.',
    canonical: 'https://scanandprint.in/',
    keywords:
      'scan and print, automatically print, scan qr and print, scan & print, automatic printing, scan qr print, print automatically, qr code printing, cyber cafe print software, photocopy shop software, automatic document printing, upi print kiosk, instant print india, direct mobile print',
    ogImage: 'https://scanandprint.in/images/og/og-home.png',
    ogType: 'website',
    priority: 1.0,
    changefreq: 'daily',
    h1: 'Scan & Print – Customers Scan QR Code & Automatically Print Documents!',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Scan&Print',
        url: 'https://scanandprint.in',
        logo: 'https://scanandprint.in/svgs/logo.svg',
        description: 'Scan and print automatically! Smart automated QR code document printing software for cyber cafés and print shops in India.',
        sameAs: [
          'https://www.youtube.com/@scanandprint',
          'https://www.facebook.com/scanandprint.in',
          'https://www.instagram.com/scanandprint.in/',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91 7073904473',
          contactType: 'customer support',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi']
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Scan&Print',
        url: 'https://scanandprint.in',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://scanandprint.in/?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Scan&Print Agent & Kiosk',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Windows 10, Windows 11, Web',
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'INR',
          description: '100% Free 2-Hour Full Feature Demo Trial'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '128'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Do I need an expensive WiFi or smart printer to use Scan&Print?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No! Scan&Print works seamlessly with your existing standard USB desktop printer (Epson, HP, Canon, Brother, Ricoh, etc.). You do not need to buy any new hardware or expensive WiFi machines.'
            }
          },
          {
            '@type': 'Question',
            name: 'How does payment collection work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Customers pay automatically using UPI (PhonePe, Google Pay, Paytm, etc.) right on the mobile kiosk before printing starts. The payment is routed directly to your shop owner bank account.'
            }
          },
          {
            '@type': 'Question',
            name: 'Are customer uploaded documents private and secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, 100%. Customer documents are used strictly to execute the print command and are permanently auto-deleted from servers immediately upon print completion. We never store, inspect, or sell files.'
            }
          },
          {
            '@type': 'Question',
            name: 'How long does it take to setup Scan&Print in my shop?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Setup takes under 2 minutes. Simply register your shop, download the lightweight Desktop Agent on your PC, select your printer, and display your printed QR code at the counter.'
            }
          }
        ]
      }
    ]
  },

  '/features': {
    title: 'Smart Features – Automated Queue-Free Printing for Print Shops | Scan&Print',
    description:
      'Discover powerful features of Scan&Print: Instant QR scanning, automatic UPI payments, live desktop printer agent, multi-printer routing, and zero data storage privacy.',
    canonical: 'https://scanandprint.in/features',
    keywords:
      'print automation features, qr code print kiosk, cyber cafe software, multi-printer routing, instant upi billing, zero queue printing',
    ogImage: 'https://scanandprint.in/images/og/og-features.png',
    ogType: 'website',
    priority: 0.9,
    changefreq: 'weekly',
    h1: 'Smart Features of Scan&Print',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Scan&Print Smart Features',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Windows, Web',
        description: 'Comprehensive automated printing solution with QR kiosk, desktop agent, and direct UPI collection.'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://scanandprint.in/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Features',
            item: 'https://scanandprint.in/features'
          }
        ]
      }
    ]
  },

  '/pricing': {
    title: 'Scan&Print Pricing – 48-Hour Free Demo & Affordable Monthly/Yearly Plans',
    description:
      'Transparent, affordable pricing for Indian print shops. Get a 100% free 2-hour demo trial with zero commitments, or choose our monthly ₹1,299 or yearly ₹1,799 plans.',
    canonical: 'https://scanandprint.in/pricing',
    keywords:
      'scan and print pricing, cyber cafe software price, printing kiosk subscription, free demo print software, affordable print kiosk',
    ogImage: 'https://scanandprint.in/images/og/og-pricing.png',
    ogType: 'website',
    priority: 0.9,
    changefreq: 'weekly',
    h1: 'Choose the Perfect Plan for Your Shop',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Scan&Print Merchant Subscription',
        description: 'Automated QR code printing system for cyber cafés and print shops in India.',
        brand: {
          '@type': 'Brand',
          name: 'Scan&Print'
        },
        offers: [
          {
            '@type': 'Offer',
            name: '48-Hour Free Demo',
            price: '0.00',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            url: 'https://scanandprint.in/pricing'
          },
          {
            '@type': 'Offer',
            name: 'Monthly Plan',
            price: '199.00',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            url: 'https://scanandprint.in/pricing'
          },
          {
            '@type': 'Offer',
            name: 'Yearly Plan',
            price: '999.00',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            url: 'https://scanandprint.in/pricing'
          }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is included in the 48-Hour Free Demo?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The 48-Hour Demo gives you instant, 100% free access to connect your printer, test real customer QR print jobs, and experience the full automated workflow with zero credit card or upfront payment needed.'
            }
          },
          {
            '@type': 'Question',
            name: 'Can I cancel or switch my plan anytime?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your shop owner dashboard without hidden lock-in contracts.'
            }
          }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://scanandprint.in/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Pricing',
            item: 'https://scanandprint.in/pricing'
          }
        ]
      }
    ]
  },

  '/how-to-setup': {
    title: 'How to Setup Scan&Print in 2 Minutes – Step-by-Step Hardware Guide',
    description:
      'Learn how to connect your existing USB printer to Scan&Print in just 2 minutes. Simple 4-step setup: register shop, download desktop agent, pair printer, display QR code.',
    canonical: 'https://scanandprint.in/how-to-setup',
    keywords:
      'how to setup scan and print, usb printer connection, print kiosk setup guide, epson canon hp printer setup, cyber cafe automation guide',
    ogImage: 'https://scanandprint.in/images/og/og-how-to-setup.png',
    ogType: 'article',
    priority: 0.8,
    changefreq: 'monthly',
    h1: 'Connect Your Printer in Under 2 Minutes',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Setup Scan&Print with Any Standard Printer',
        description: 'Complete 4-step guide to automate printing in your cyber café or print shop.',
        totalTime: 'PT2M',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Register Your Shop',
            text: 'Sign up with your shop name, mobile number, and city to generate your custom dashboard.'
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Download Desktop Agent',
            text: 'Install the lightweight Scan&Print Desktop Agent on your Windows computer connected to the printer.'
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Pair Your Printer',
            text: 'Launch the agent and select your active USB or Network printer from the dropdown menu.'
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Display Counter QR Code',
            text: 'Download and place your branded counter QR code standee on your reception desk for customers to scan.'
          }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://scanandprint.in/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'How to Setup',
            item: 'https://scanandprint.in/how-to-setup'
          }
        ]
      }
    ]
  },

  '/about': {
    title: 'About Scan&Print – Built by Print Shop Owners for Cyber Cafés in India',
    description:
      'Read how Scan&Print was born on an active cyber café counter to solve WhatsApp print chaos, long queues, and manual payment tracking across Indian printing shops.',
    canonical: 'https://scanandprint.in/about',
    keywords:
      'about scan and print, cyber cafe printing solution india, print shop founders, print automation story, smart printing mission',
    ogImage: 'https://scanandprint.in/images/og/og-about.png',
    ogType: 'website',
    priority: 0.8,
    changefreq: 'monthly',
    h1: 'Built by Shop Owners, for Shop Owners',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About Scan&Print',
        description: 'The journey and mission of Scan&Print empowering small business print shop owners across India.',
        mainEntity: {
          '@type': 'Organization',
          name: 'Scan&Print',
          foundingDate: '2026',
          url: 'https://scanandprint.in'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://scanandprint.in/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'About Us',
            item: 'https://scanandprint.in/about'
          }
        ]
      }
    ]
  },

  '/contact': {
    title: 'Contact Scan&Print – 24/7 Dedicated Support & Merchant Assistance',
    description:
      'Get in touch with Scan&Print support for hardware compatibility, onboarding assistance, or merchant inquiries. Reach us via WhatsApp, phone, or direct contact form.',
    canonical: 'https://scanandprint.in/contact',
    keywords:
      'contact scan and print, print shop support, customer care print software, whatsapp support scan and print, cyber cafe helpdesk',
    ogImage: 'https://scanandprint.in/images/og/og-contact.png',
    ogType: 'website',
    priority: 0.8,
    changefreq: 'monthly',
    h1: 'Get in Touch with Scan&Print',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Scan&Print',
        description: 'Customer service, technical support, and merchant inquiries for Scan&Print.',
        mainEntity: {
          '@type': 'Organization',
          name: 'Scan&Print',
          url: 'https://scanandprint.in',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+91 98765 43210',
            contactType: 'customer service',
            email: 'support@scanandprint.in',
            availableLanguage: ['English', 'Hindi']
          }
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://scanandprint.in/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Contact',
            item: 'https://scanandprint.in/contact'
          }
        ]
      }
    ]
  },

  '/disclaimer': {
    title: 'Legal Disclaimer & Terms of Service Notice | Scan&Print',
    description:
      'Review the official legal disclaimer, service limitations, and operational terms for Scan&Print automated printing SaaS platform.',
    canonical: 'https://scanandprint.in/disclaimer',
    keywords: 'scan and print disclaimer, legal notice, service limitations, printing terms',
    ogImage: 'https://scanandprint.in/images/og/og-legal.png',
    ogType: 'website',
    priority: 0.5,
    changefreq: 'yearly',
    h1: 'Scan&Print Disclaimer',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Legal Disclaimer - Scan&Print',
        url: 'https://scanandprint.in/disclaimer'
      }
    ]
  },

  '/privacy-policy': {
    title: 'Privacy Policy – 100% Auto-Delete Document Security | Scan&Print',
    description:
      'Customer document privacy guarantee: Customer files are strictly used for live printing and permanently deleted immediately after printing. Zero storage or data sharing.',
    canonical: 'https://scanandprint.in/privacy-policy',
    keywords: 'privacy policy scan and print, document security, auto delete print files, cyber cafe privacy',
    ogImage: 'https://scanandprint.in/images/og/og-legal.png',
    ogType: 'website',
    priority: 0.6,
    changefreq: 'monthly',
    h1: 'Scan&Print Privacy Policy',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Privacy Policy - Scan&Print',
        url: 'https://scanandprint.in/privacy-policy'
      }
    ]
  },

  '/refund-policy': {
    title: 'Refund & Cancellation Policy – 7-Day Money Back Guarantee | Scan&Print',
    description:
      'Scan&Print offers a transparent 7-day money-back guarantee for all subscription plans. Read our complete cancellation and refund process.',
    canonical: 'https://scanandprint.in/refund-policy',
    keywords: 'refund policy scan and print, money back guarantee, subscription refund, cancellation terms',
    ogImage: 'https://scanandprint.in/images/og/og-legal.png',
    ogType: 'website',
    priority: 0.6,
    changefreq: 'monthly',
    h1: 'Scan&Print Refund Policy',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Refund & Cancellation Policy - Scan&Print',
        url: 'https://scanandprint.in/refund-policy'
      }
    ]
  },

  '/terms-and-conditions': {
    title: 'Terms and Conditions – Merchant & User Agreement | Scan&Print',
    description:
      'Official Terms and Conditions governing the use of Scan&Print platform, agent software, payment processing, and merchant subscription services.',
    canonical: 'https://scanandprint.in/terms-and-conditions',
    keywords: 'terms and conditions scan and print, merchant agreement, user terms, service agreement',
    ogImage: 'https://scanandprint.in/images/og/og-legal.png',
    ogType: 'website',
    priority: 0.6,
    changefreq: 'monthly',
    h1: 'Scan&Print Terms & Conditions',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Terms & Conditions - Scan&Print',
        url: 'https://scanandprint.in/terms-and-conditions'
      }
    ]
  },

  '/register': {
    title: 'Register Your Print Shop – Start 2-Hour Free Demo | Scan&Print',
    description:
      'Create your Scan&Print shop account in under 2 minutes. Start automating customer print jobs, receive direct UPI payments, and eliminate counter congestion today.',
    canonical: 'https://scanandprint.in/register',
    keywords: 'register print shop, cyber cafe sign up, free demo trial, start automated printing',
    ogImage: 'https://scanandprint.in/images/og/og-register.png',
    ogType: 'website',
    priority: 0.8,
    changefreq: 'monthly',
    h1: 'Register Your Print Shop',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Register Shop - Scan&Print',
        url: 'https://scanandprint.in/register'
      }
    ]
  },

  '/shop-login': {
    title: 'Shop Owner Login – Access Your Printing Dashboard | Scan&Print',
    description:
      'Login to your Scan&Print merchant dashboard to manage active print jobs, monitor printer status, view UPI earnings, and customize counter QR codes.',
    canonical: 'https://scanandprint.in/shop-login',
    keywords: 'shop owner login, cyber cafe dashboard login, print merchant sign in',
    ogImage: 'https://scanandprint.in/images/og/og-home.png',
    ogType: 'website',
    priority: 0.7,
    changefreq: 'monthly',
    h1: 'Shop Owner Login',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Shop Login - Scan&Print',
        url: 'https://scanandprint.in/shop-login'
      }
    ]
  }
}
