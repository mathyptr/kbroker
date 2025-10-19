docker-compose -f  /mnt/944083a7-26f1-424e-b5c7-ab4e081f1f98/swam-qesm/docker/kafka/docker-compose.yml run --rm -v /mnt/944083a7-26f1-424e-b5c7-ab4e081f1f98/swam-qesm/docker/kafka/samples-k6kafka:/scripts k6-kafka run /scripts/delete_topic.js
docker-compose -f  /mnt/944083a7-26f1-424e-b5c7-ab4e081f1f98/swam-qesm/docker/kafka/docker-compose.yml run --rm -v /mnt/944083a7-26f1-424e-b5c7-ab4e081f1f98/swam-qesm/docker/kafka/samples-k6kafka:/scripts k6-kafka run /scripts/create_topic.js


