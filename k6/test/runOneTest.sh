#!/bin/bash

echo "****TEST: "$test
export script_dir=$base_script_dir/$test
echo  $script_dir
$script_dir/delcreatetopic.sh
mate-terminal -e $script_dir/consumer.sh
sleep 3
mate-terminal -e $script_dir/producer.sh
