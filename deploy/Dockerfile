# Multi-stage Dockerfile for Box Factory ERP
FROM node:20-alpine AS builder

WORKDIR /app

# Install client dependencies & build
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client ./client
RUN cd client && npm run build

# Production Server stage
FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --production

COPY server ./server
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "server/index.js"]
