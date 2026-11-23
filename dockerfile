FROM node:22-alpine AS builder

WORKDIR /build

# Install pnpm v9 to match lockfileVersion 9.0 and avoid v10 build script restrictions
RUN npm install -g pnpm@9

# Copy package definition and lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application source
COPY . .

# Build production bundle
RUN pnpm run build


FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /build/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
