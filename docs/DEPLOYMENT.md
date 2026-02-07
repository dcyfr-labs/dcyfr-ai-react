# Deployment Guide - React SPA Deployment

**Target Audience:** DevOps engineers, frontend developers  
**Prerequisites:** Understanding of static hosting, environment variables, CI/CD basics

---

## Overview

This Vite + React SPA can be deployed to:
- **Vercel** (recommended for frontend)
- **Netlify** (excellent for SPAs)
- **GitHub Pages** (free static hosting)
- **Docker** (containerized deployment)
- **AWS S3 + CloudFront** (scalable static hosting)
- **Self-hosted** (NGINX/Apache)

---

## Vercel Deployment

### One-Click Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://api.example.com
VITE_APP_ENV=production
```

**Important:** Vite env vars must start with `VITE_` to be exposed to the client.

---

## Netlify Deployment

### Netlify CLI

```bash
# Install CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_API_URL = "https://api.example.com"

[context.deploy-preview.environment]
  VITE_API_URL = "https://api-staging.example.com"
```

### Branch Deploys

```toml
[context.branch-deploy]
  command = "npm run build"
```

Netlify automatically creates preview deployments for each branch.

---

## GitHub Pages

### Setup

1. **Install gh-pages:**
```bash
npm install -D gh-pages
```

2. **Add deploy script:**
```json
// package.json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Configure base path:**
```typescript
// vite.config.ts
export default defineConfig({
  base: '/your-repo-name/', // Use repo name for GitHub Pages
});
```

4. **Deploy:**
```bash
npm run deploy
```

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build for smaller image
FROM node:24-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build app
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### NGINX Configuration

```nginx
# nginx.conf
events {
  worker_connections 1024;
}

http {
  include mime.types;
  default_type application/octet-stream;

  server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_comp_level 9;

    # SPA routing - all routes serve index.html
    location / {
      try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
  }
}
```

### Build and Run

```bash
# Build image
docker build -t my-react-app .

# Run container
docker run -d -p 8080:80 my-react-app

# Access at http://localhost:8080
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

---

## AWS S3 + CloudFront

### S3 Bucket Setup

```bash
# Install AWS CLI
npm install -g aws-cli

# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://my-react-app

# Enable static website hosting
aws s3 website s3://my-react-app --index-document index.html --error-document index.html

# Upload build
npm run build
aws s3 sync dist/ s3://my-react-app --delete
```

### Bucket Policy (Public Read)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-react-app/*"
    }
  ]
}
```

### CloudFront Distribution

```json
{
  "DistributionConfig": {
    "Origins": [
      {
        "Id": "S3-my-react-app",
        "DomainName": "my-react-app.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ],
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-my-react-app",
      "ViewerProtocolPolicy": "redirect-to-https",
      "Compress": true
    },
    "CustomErrorResponses": [
      {
        "ErrorCode": 403,
        "ResponseCode": 200,
        "ResponsePagePath": "/index.html"
      },
      {
        "ErrorCode": 404,
        "ResponseCode": 200,
        "ResponsePagePath": "/index.html"
      }
    ]
  }
}
```

---

## Environment Variables

### Development (.env.development)

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_ENABLE_DEVTOOLS=true
```

### Production (.env.production)

```env
VITE_API_URL=https://api.example.com
VITE_APP_ENV=production
VITE_ENABLE_DEVTOOLS=false
```

### Access in Code

```typescript
// src/config/index.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  env: import.meta.env.VITE_APP_ENV || 'development',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

// Usage
import { config } from '@/config';
const apiUrl = config.apiUrl;
```

### Runtime Configuration

For dynamic configuration (not known at build time):

```html
<!-- public/config.js -->
<script>
  window.APP_CONFIG = {
    apiUrl: 'https://api.example.com',
  };
</script>
```

```typescript
// src/config/index.ts
declare global {
  interface Window {
    APP_CONFIG?: {
      apiUrl: string;
    };
  }
}

export const config = {
  apiUrl: window.APP_CONFIG?.apiUrl || import.meta.env.VITE_API_URL,
};
```

---

## Build Optimization

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate sourcemaps for production (optional)
    sourcemap: false,
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['@tanstack/react-router'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },
  },
});
```

### Bundle Analysis

```bash
# Install plugin
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }),
  ],
});

# Build and view bundle analysis
npm run build
```

---

## CI/CD Pipeline

### GitHub Actions (Vercel)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### GitLab CI (Netlify)

```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy

build:
  stage: build
  image: node:24-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
  only:
    - main

deploy:
  stage: deploy
  image: node:24-alpine
  script:
    - npm install -g netlify-cli
    - netlify deploy --prod --dir=dist --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
  dependencies:
    - build
  only:
    - main
```

---

## Custom Domain & SSL

### Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `example.com`)
3. Configure DNS:
   ```
   A     @    76.76.21.21
   CNAME www  cname.vercel-dns.com
   ```
4. SSL automatically provisioned

### Netlify

1. Go to Site Settings → Domain Management
2. Add custom domain
3. Netlify provides automatic HTTPS via Let's Encrypt

### Self-Hosted (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d example.com -d www.example.com

# Auto-renewal (crontab)
0 0 * * * certbot renew --quiet
```

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load routes
import { lazyRouteComponent } from '@tanstack/react-router';

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: lazyRouteComponent(() => import('./about')),
});
```

### Image Optimization

```bash
# Install image optimization plugin
npm install -D vite-plugin-imagemin

# Configure in vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      svgo: { plugins: [{ removeViewBox: false }] },
    }),
  ],
});
```

### Compression

NGINX (already in config above) or configure in Vite:

```typescript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
});
```

---

## Monitoring

### Sentry Integration

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 1.0,
});
```

### Web Vitals

```bash
npm install web-vitals
```

```typescript
// src/lib/vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  console.log(metric);
  // Send to analytics service
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

---

## Troubleshooting

### 404 on Direct URL Access

**Problem:** SPA routes return 404 when accessed directly.

**Solution:** Configure server to serve `index.html` for all routes:

```nginx
# NGINX
location / {
  try_files $uri /index.html;
}
```

```json
// Vercel vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Environment Variables Not Working

**Problem:** Vite env vars not accessible.

**Solution:** Ensure variables start with `VITE_`:

```env
❌ API_URL=https://api.example.com
✅ VITE_API_URL=https://api.example.com
```

### Build Fails on CI

**Problem:** `Error: Cannot find module 'vite'`

**Solution:** Use `npm ci` instead of `npm install` for reproducible builds:

```yaml
- name: Install dependencies
  run: npm ci
```

---

**Last Updated:** February 7, 2026  
**Version:** 1.0.0
