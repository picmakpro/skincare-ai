/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION=1` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    domains: [
      'm.media-amazon.com',
      'www.sephora.com', 
      'images.squarespace-cdn.com',
      'africa.cerave.com',
      'media.carrefour.fr',
      'cdn.pim.mesoigner.fr',
      'img.newpharma.net',
      'statics.docmorris.fr',
      'images.asos-media.com'
    ]
  }
};
export default config;