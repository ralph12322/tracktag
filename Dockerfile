FROM node:20-slim

# Install required libraries for Chromium to run
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libxshmfence1 \
  xdg-utils \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*



# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies (this will include Puppeteer)
RUN npm ci

# Install bundled Chromium via Puppeteer
RUN npx puppeteer browsers install chrome

# Copy all app files
COPY . .

# Build the app
RUN npm run build

# Run the app
CMD ["npm", "run", "start"]
