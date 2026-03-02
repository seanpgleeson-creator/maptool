// Load .env from the folder that contains this file (project root), so API routes see vars even if dev server was started from another cwd
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
