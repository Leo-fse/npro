/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    // Disable SSR completely
    reactStrictMode: false,
    // Images configuration for static export
    images: {
        unoptimized: true
    }
};

export default nextConfig;
