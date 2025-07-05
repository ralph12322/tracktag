#!/usr/bin/env bash

# Install puppeteer browser
echo "🔧 Running postinstall to fetch Chrome..."
npm run postinstall

# Then build Next.js
npm run build
