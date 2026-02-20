# Aven - Verifiable Lead Intelligence

Sovereign AI agent for B2B lead validation running on EigenCompute.

## Deploy to Vercel (No Terminal Required)

### Method 1: Direct Upload to Vercel

1. Go to https://vercel.com and sign up/login
2. Click "Add New" → "Project"
3. Click "Deploy without Git" (bottom of page)
4. Drag this entire folder into the upload area
5. Wait for build to complete
6. Done! You'll get a URL like `aven-app.vercel.app`

### Method 2: Via GitHub (if you prefer)

1. Go to https://github.com and create a new repository called "aven-app"
2. Upload all files from this folder to the repository
3. Go to https://vercel.com
4. Click "Import Project"
5. Connect to your GitHub repo
6. Click "Deploy"

## Agent Endpoint

The app connects to your deployed agent at:
- **URL:** `http://136.116.32.35:3000`
- **Platform:** EigenCompute TEE
- **Status:** Running

## Local Development (Optional)

If you want to run locally:

```bash
npm install
npm start
```

Then open http://localhost:3000
