#!/bin/bash
docker-compose -f  $docker_compose_dir/docker-compose.yml run --rm -v $script_dir:/scripts k6-kafka run /scripts/producer.js  
read -p "Press any key to resume ..."

