aws ecr get-login --no-include-email --region ap-southeast-1 | sh
tsc
docker build -t reader .
docker tag reader:latest 897420788211.dkr.ecr.ap-southeast-1.amazonaws.com/reader:$1
docker push 897420788211.dkr.ecr.ap-southeast-1.amazonaws.com/reader:$1