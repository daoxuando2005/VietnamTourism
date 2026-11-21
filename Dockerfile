FROM node:24.22.3-alpine AS build
WORKDIR /build
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY public public
COPY src src
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY VITE_API_URL=/api/v1
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.28.2-alpine
COPY infra/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=101:101 /build/dist /usr/share/nginx/html
USER 101
EXPOSE 8080
