#!/bin/bash
docker-compose -f  $docker_compose_dir/docker-compose.yml run --rm -v $script_dir:/scripts k6-kafka run /scripts/delete_topic.js
#!/bin/bash
docker-compose -f  $docker_compose_dir/docker-compose.yml run --rm -v $script_dir:/scripts k6-kafka run /scripts/create_topic.js


