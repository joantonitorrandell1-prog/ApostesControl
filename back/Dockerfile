FROM node:20-alpine AS builder
WORKDIR /app

# Copy files
COPY contract ./contract
COPY back ./back

# Build contract
WORKDIR /app/contract
RUN npm install
RUN npm run build

# Build backend
WORKDIR /app/back
RUN npm install --legacy-peer-deps
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/contract /app/contract
COPY --from=builder /app/back /app/back

WORKDIR /app/back
EXPOSE 4000
ENV NODE_ENV=production
CMD ["sh", "-c", "npx drizzle-kit push && node dist/main.js"]
