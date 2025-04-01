#!/bin/bash
set -e
gitHash=$(git rev-parse HEAD)
STAGE="${ENV_NAME:-MAIN}"
echo "Will build for Stage: $STAGE"
rm -rf /app/build
docker build -f Dockerfile . -t scts-ocr-service-frontend:"$gitHash" -t scts-ocr-service-frontend:latest --build-arg STAGE_ARG="$STAGE"
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 994318991266.dkr.ecr.eu-west-1.amazonaws.com
docker tag scts-ocr-service-frontend:"$gitHash" 994318991266.dkr.ecr.eu-west-1.amazonaws.com/scts-ocr-service-frontend:"$gitHash"
docker push 994318991266.dkr.ecr.eu-west-1.amazonaws.com/scts-ocr-service-frontend:"$gitHash"
echo "pushed image"
#aws eks update-kubeconfig --region eu-west-1 --name sandbox --role-arn arn:aws:iam::994318991266:role/Developer
#echo "got credentials"
#BACKEND=$(aws ssm get-parameter --name "/backend/$STAGE/BACKEND" --with-decryption --no-cli-pager --query "Parameter.Value" --output text)
#echo "Backend url: $BACKEND"
#cat deployment-sandbox.yaml | sed "s,{{GIT_HASH}},$gitHash,g" | sed "s,{{STAGE-LOWER}},${STAGE,,},g" | sed "s,{{STAGE-UPPER}},${STAGE},g" | sed "s,{{BACKEND}},${BACKEND},g" | sed "s,{{ENV_JS_PROXY_ENDPOINT}},${BACKEND},g" | kubectl apply -f -
#echo "deployed image"