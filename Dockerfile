# 1. Imagen base
FROM node:20-alpine AS base

# 2. Instalar dependencias (Etapa: deps)
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar pnpm
RUN corepack enable

COPY package.json pnpm-lock.yaml* ./
RUN pnpm i --frozen-lockfile

# 3. Construir el código (Etapa: builder)
FROM base AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar cliente de Prisma antes del build (IMPORTANTE)
RUN npx prisma generate

# Argumentos de construcción (necesarios para variables NEXT_PUBLIC_)
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Construir la app
RUN pnpm run build

# 4. Imagen final para producción (Etapa: runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Instalar dependencias necesarias para Prisma (OpenSSL)
RUN apk add --no-cache openssl libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios para correr
COPY --from=builder /app/public ./public
COPY --from=builder /app/public/uploads ./public/uploads
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Asegurar permisos para subir archivos
USER root
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]