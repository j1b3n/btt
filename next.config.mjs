/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Disable webpack cache in development
    if (dev) {
      config.cache = false;
    }

    return config;
  },
  experimental: {
    esmExternals: true
  }
};

export default nextConfig;