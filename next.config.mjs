/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://isp-backend-api-git-main-shuja-uddin-sufis-projects.vercel.app/:path*',
            },
        ];
    },
};

export default nextConfig;
