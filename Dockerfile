FROM node:18
WORKDIR /app
COPY package.json yarn.lock ./
COPY backend backend
COPY frontend frontend
COPY admin admin
RUN yarn install --frozen-lockfile
CMD ["yarn", "start"]
