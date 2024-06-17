/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "nsmqcompanion.s3.eu-north-1.amazonaws.com",
                pathname: "**",
            }
        ],
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/auth/login',
                permanent: true,
            },
        ]
    },
};

export default nextConfig;
