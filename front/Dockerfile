FROM node:20-alpine AS builder
WORKDIR /app

# Copy files
COPY contract ./contract
COPY front ./front

# Build contract
WORKDIR /app/contract
RUN npm install
RUN npm run build

# Build frontend
WORKDIR /app/front
RUN npm install --legacy-peer-deps
ENV NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:4000
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/contract /app/contract
COPY --from=builder /app/front /app/front

WORKDIR /app/front
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
