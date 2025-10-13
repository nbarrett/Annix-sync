# Dockerfile
FROM gillesteuwen/tinytex-node20:amd64

USER root
RUN apt-get update && apt-get install -y libpq-dev

WORKDIR /usr/src/app
COPY yarn.lock package.json ./
RUN yarn install
COPY . .

EXPOSE 4000
CMD ["yarn", "start"]
