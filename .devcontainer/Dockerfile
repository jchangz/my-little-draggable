FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye
RUN apt-get update
USER node
RUN npx playwright install \
    && npx playwright install-deps