FROM node:20-alpine

WORKDIR /app

COPY apps/web/package.json /app/package.json
# Install dependencies
RUN npm install

COPY apps/web /app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["npm", "run", "dev"]
