FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM deps AS validate
COPY . .
RUN pnpm lint && pnpm exec tsc --noEmit

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=/api/v1
ARG NEXT_PUBLIC_WS_URL=/api/v1/ws
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL CARGO_STANDALONE=true
RUN corepack enable && pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S cargo && adduser -S cargo -G cargo
COPY --from=build --chown=cargo:cargo /app/.next/standalone ./
COPY --from=build --chown=cargo:cargo /app/.next/static ./.next/static
USER cargo
EXPOSE 3000
CMD ["node", "server.js"]

