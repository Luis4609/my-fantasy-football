FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

# Create database directory to be mounted as a volume
RUN mkdir -p /app/data

ENV PORT=3001
ENV DB_TYPE=sqlite
ENV SQLITE_DB_PATH=/app/data/database.sqlite
ENV JWT_SECRET=super_secret_key_change_me_in_production_12345

EXPOSE 3001
CMD ["node", "dist/server.js"]
