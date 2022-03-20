# Instructions to run docker engine when building the image of the microservice

# base image to use for the microservice image.
# we also include :tag of the exact version to replicate dev env.
FROM node:14.19-alpine3.14@sha256:8c93166ecea91d8384d9f1768ceaca1cd8bc22c1eb13005cecfb491588bd8169 AS base

# Metadata about image
LABEL maintainer="Amasia Nalbandian<analbandian@myseneca.ca>"
LABEL description="Fragments microservice front-end"

# ------------------ ENVIRONMENT VARIABLES ------------------
# We default to use port 8080 in our service
ENV PORT=80

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

#------------------------------------------------------------

# Use /app as our working directory
WORKDIR /app

# Notes on following commands: 
# We need to cpy our packages for our microservice, then install them. After that
# copy our source code, and then start the service. 

# Copy the package.json and package-lock.json files into /app
# since we declare /app as workdir, we can also copy to ./
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm i

# Second stage build the app
FROM node:14.19-alpine3.14@sha256:8c93166ecea91d8384d9f1768ceaca1cd8bc22c1eb13005cecfb491588bd8169 AS build

# Use /app as our working directory
WORKDIR /app

#Copy node modules and jsons from base
COPY .env ./
COPY --from=base /app/package*.json ./ 
COPY --from=base /app/node_modules ./node_modules

# Copy src to /app/src/
COPY src ./src

# Start the container by running our server
RUN npm run build

## Third stage on nginx
FROM nginx:stable-alpine@sha256:74694f2de64c44787a81f0554aa45b281e468c0c58b8665fafceda624d31e556 AS deploy


# COPY items we need to run
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/.parcel-cache /usr/share/nginx/html

# We run our service on port 8080
EXPOSE 80
