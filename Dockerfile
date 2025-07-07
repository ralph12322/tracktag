FROM ghcr.io/puppeteer/puppeteer:24.11.2

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies (including patch-package now in dependencies)
RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]
