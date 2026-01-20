# 🏗️ Velox Cloud Infrastructure & Deployment Spec (v3.2)

**Status:** Production (Compute Engine / VM)
**Criticality:** High
**Last Updated:** 2026-01-19

---

## 1. Architecture Overview

The Velox Control Tower is a **Hybrid Monolith** running on a Linux VM (Google Compute Engine).

* **Runtime:** Node.js v20 (Managed by PM2)
* **Database:** SQLite (`velox_core.db` - Local File)
* **Storage:** Local Filesystem (`ACC_Sync/` folder)
* **AI Engine:** Google Gemini (Via API)
* **Connectivity:**
    * **Mobile App:** Connects via Public IP (or Tunnel during Dev).
    * **Dashboard:** Served statically from `public/` folder.

---

## 2. Docker Deployment Strategy

If migrating to **Cloud Run** or a **Container**, the following Dockerfile MUST be used to ensure data persistence.

### Dockerfile (Backend)
* **Port:** Exposes `8080`.
* **Persistence:** Uses a Volume for `ACC_Sync` (PDFs/Photos) and the Database.

```dockerfile
# Use the official Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# ⚠️ CRITICAL: Create directory structure
# These folders will be overlaid by Persistent Volumes at runtime
RUN mkdir -p ACC_Sync/Site_Photos
RUN mkdir -p ACC_Sync/Audio_Logs

# Expose the port
ENV PORT=8080
EXPOSE 8080

# Start the server using tsx
CMD ["npx", "tsx", "src/index.ts"]