import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Set the output file tracing root to this project
  outputFileTracingRoot: path.join(__dirname, './'),

  // Disable ESLint during production builds (warnings are fine)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image configuration
  images: {
    unoptimized: true,
  },
}

export default nextConfig
