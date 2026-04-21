# Base image
FROM node:18

# Install ffmpeg + python
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip

# Install yt-dlp
RUN pip3 install yt-dlp

# App directory
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install

COPY . .

# Port
ENV PORT=3000
EXPOSE 3000

# Start app
CMD ["node", "server.js"]
