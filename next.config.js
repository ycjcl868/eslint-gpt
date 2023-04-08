/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  optimizeFonts: true,
  experimental: {
    optimizeCss: true
  },
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'zh'
  },
  async headers() {
    return [
      {
        source: '/:slug',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ]
      }
    ]
  }
}
