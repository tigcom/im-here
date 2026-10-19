/** @type {import('next').NextConfig} */
const apiServerUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.API_SERVER_URL || 'http://localhost:8080').replace(/\/+$/, '');
const webSocketUrl = process.env.NEXT_PUBLIC_WS_URL || `${apiServerUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')}/api/ws`;

const nextConfig = {
  reactStrictMode: false,
  env: { NEXT_PUBLIC_WS_URL: webSocketUrl },
  async rewrites() {
    return [
      {
        source: '/api/upload/files/:path*',
        destination: `${apiServerUrl}/api/upload/files/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${apiServerUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
