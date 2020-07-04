## From main directory of repository, in order to build the container, run:


## $ sudo docker build --build-arg build_env=PROD -t justpoker ./
## build_env=(DEV|PROD)

## In order to run the container, run:
## $ docker run -d justpoker
FROM node:13

# set build_env default
ARG build_env=PROD

# root
# copy shared files
WORKDIR /justpoker
COPY . ./

# ui
WORKDIR /justpoker/ui
# set env for react front-end
RUN echo REACT_APP_ENVIRONMENT=${build_env} > .env
RUN npm install
RUN npm run build


# server
WORKDIR /justpoker/server
RUN npm install

# set env for node back-end
ENV NODE_SERVER_ENVIRONMENT=${build_env}
ENV ROOT_SERVER_DIR="/justpoker"

EXPOSE 8080

# Build and start the server.
CMD ["npm", "start"]

