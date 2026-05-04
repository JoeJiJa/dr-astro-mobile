---
description: How to deploy the Dr. Astro application to Cloudflare Pages
---

This workflow describes the process of building and deploying the Next.js application to Cloudflare Pages.

// turbo-all
1. Build and deploy the application
   ```powershell
   npm.cmd run deploy
   ```

2. Verify the deployment
   After completion, the CLI will provide a unique deployment URL (e.g., `https://[hash].dr-astro.pages.dev`). The production URL is typically `https://dr-astro.pages.dev`.
