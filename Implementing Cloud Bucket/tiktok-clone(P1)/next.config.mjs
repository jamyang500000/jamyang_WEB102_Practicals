import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  // Pin Turbopack's project root to this folder so Next.js doesn't crawl
  // upward and pick a stray package-lock.json (e.g. in C:\Users\DELL\)
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
