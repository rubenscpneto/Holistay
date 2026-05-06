/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/settings",
        destination: "/properties",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

