FROM oven/bun:1.3.9-alpine as base

COPY ./* ./

RUN bun install

EXPOSE 3000
CMD [ "bun", "run", "index.ts" ]