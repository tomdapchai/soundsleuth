import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb", // Set the body size limit to 10MB
        },
    },
};

export default nextConfig;
