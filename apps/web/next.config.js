/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  experimental: {
    serverComponentsExternalPackages: ['@worldview/way-engine'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@worldview/way-engine': 'commonjs @worldview/way-engine'
      });
    }
    return config;
  },
};

export default nextConfig;
