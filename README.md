docker build -t ds2 .
 docker run -d -p 3000:8080 --name ds1 ds2
docker update --restart=always ds1