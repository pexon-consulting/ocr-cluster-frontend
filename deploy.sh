#!/bin/bash
set -e
gitHash=$(git rev-parse HEAD)
STAGE="${ENV_NAME:-MAIN}"
echo "Will build for Stage: $STAGE"
rm -rf /app/build
echo docker login --username AWS --password-stdin 975050319617.dkr.ecr.eu-central-1.amazonaws.com
docker build -f Dockerfile . -t frontend:"$gitHash" -t frontend:latest --build-arg STAGE_ARG="$STAGE"
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 975050319617.dkr.ecr.eu-central-1.amazonaws.com
docker tag frontend:"$gitHash" 975050319617.dkr.ecr.eu-central-1.amazonaws.com/frontend:latest
docker push 994318991266.dkr.ecr.eu-west-1.amazonaws.com/frontend:"$gitHash"
echo "pushed image"
#TODO update ECS