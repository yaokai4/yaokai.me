/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  async redirects() {
    return [
      {
        source: "/playbooks",
        destination: "/playbook",
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
