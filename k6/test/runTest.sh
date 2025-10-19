#!/bin/bash
export docker_compose_dir="/mnt/944083a7-26f1-424e-b5c7-ab4e081f1f98/swam-qesm/docker/kafka"
export base_script_dir="/mnt/944083a7-26f1-424e-b5c7-ab4e081f1f98/swam-qesm/docker/kafka/prove"

test="test50_1"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test50_2"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test50_3"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test150_1"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test150_2"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test150_3"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test350_1"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test350_2"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test350_3"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test500_1"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test500_2"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test500_3"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test700_1"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test700_2"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

sleep 240
test="test700_3"
export script_dir=$base_script_dir/$test
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
mate-terminal -e $script_dir/producer.sh

