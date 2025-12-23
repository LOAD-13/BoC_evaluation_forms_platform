/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone", // <--- ESTA LÍNEA ES CRUCIAL
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // ... resto de tu configuración
};

export default nextConfig;