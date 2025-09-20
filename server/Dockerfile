
FROM node:latest

WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --legacy-peer-deps
COPY . .

RUN npm run build

RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8022

CMD ["npm", "run", "start:prod"]
