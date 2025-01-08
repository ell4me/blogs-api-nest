FROM node:22.12.0

WORKDIR ./app

COPY ./package.json ./

RUN npm i

COPY . ./

CMD ["npm", "run", "start:debug"]
