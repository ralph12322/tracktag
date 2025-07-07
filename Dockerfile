FROM ghcr.io/puppeteer/puppeteer:24.11.2

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Start as root to allow permission changes
USER root

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the full project
COPY . .

# Fix permissions for non-root user
RUN chown -R pptruser:pptruser /usr/src/app

# Switch to non-root user
USER pptruser

# Run build
RUN npm run build

CMD ["npm", "run", "start"]
