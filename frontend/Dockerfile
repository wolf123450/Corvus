FROM node:20

WORKDIR /app

# Enable Corepack and prepare the correct Yarn version
RUN corepack enable && corepack prepare yarn@4.5.2 --activate

COPY package.json yarn.lock ./
RUN yarn install --immutable

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]