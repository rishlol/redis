FROM oven/bun:1.3.9-alpine

COPY ./* ./

RUN bun install

EXPOSE 3001
CMD [ "bun", "run", "index.ts" ]