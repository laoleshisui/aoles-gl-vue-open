TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TAG="aoles-gl-vue:$TIMESTAMP"

docker build --platform linux/amd64 --tag "$TAG" -f Dockerfile .

docker tag "$TAG" aoles-gl-vue:latest