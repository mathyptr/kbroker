#!/bin/bash
export docker_compose_dir="/mnt/944083a7-26f1-424e-b5c7-ab4e081f1f98/swam-qesm/docker/kafka"
export base_script_dir="/mnt/944083a7-26f1-424e-b5c7-ab4e081f1f98/swam-qesm/docker/kafka/prove1"


test="test2_2"
echo "****TEST: "$test
export script_dir=$base_script_dir/$test
echo  $script_dir
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
sleep 3
mate-terminal -e $script_dir/producer.sh
