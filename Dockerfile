## From main directory of repository, in order to build the container, run:


## $ sudo docker build --build-arg build_env=PROD -t justpoker ./
## build_env=(DEV|PROD), dev by default

## In order to run the container, run:
## $ sudo docker run -d -p <PORT>:8080 justpoker
## where PORT is a port on the host machine that will be bound to the container's internal port (currently 8080)
FROM node:13.12.0-alpine

# set build_env by default
ARG build_env=DEV

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
# Build and start the server.
CMD ["npm", "start"]