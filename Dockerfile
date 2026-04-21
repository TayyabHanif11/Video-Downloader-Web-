# =========================
# Base Node Image
# =========================
FROM node:18

# =========================
# Install system dependencies
# =========================
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# =========================
# Install yt-dlp in virtual env (FIX for PEP 668 error)
# =========================
RUN python3 -m venv /venv
RUN /venv/bin/pip install --upgrade pip
RUN /venv/bin/pip install yt-dlp

# Add venv to PATH
ENV PATH="/venv/bin:$PATH"

# =========================
# App setup
# =========================
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# =========================
# Port (Railway required)
# =========================
ENV PORT=3000
EXPOSE 3000

# =========================
# Start app
# =========================
CMD ["node", "server.js"]
