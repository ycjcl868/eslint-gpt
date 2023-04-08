/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  optimizeFonts: true,
  experimental: {
    optimizeCss: true
  },
  images: {
    domains: [
      'avatar.vercel.sh',
      's.gravatar.com',
      'lh3.googleusercontent.com',
      'www.datocms-assets.com',
      'avatars.dicebear.com',
      'pbs.twimg.com',
      'abs.twimg.com',
      'cdn.auth0.com'
    ]
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
