FROM ghcr.io/puppeteer/puppeteer:24.11.2

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Copy package files and install dependencies first
COPY package*.json ./
RUN npm ci

# Copy rest of the app files
COPY . .

# Fix permissions
RUN chown -R pptruser:pptruser /usr/src/app

# Run as the default non-root user again (just to be sure)
USER pptruser

# Build the app
RUN npm run build

CMD ["npm", "run", "start"]
