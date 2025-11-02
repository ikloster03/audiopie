ARG VARIANT="20-bookworm"
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libnss3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libx11-xcb1 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libgtk-3-0 \
        libxss1 \
        libxtst6 \
        libdrm2 \
        libgbm1 \
        libasound2 \
        xvfb \
    && rm -rf /var/lib/apt/lists/*

