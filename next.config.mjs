/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'violet-defiant-pinniped-328.mypinata.cloud',
                port: ''
            }
        ]
    }
};

export default nextConfig;