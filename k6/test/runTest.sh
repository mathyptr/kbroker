#!/bin/bash
export docker_compose_dir="/mnt/944083a7-26f1-424e-b5c7-ab4e081f1f98/swam-qesm/docker/kafka"
export base_script_dir="/mnt/944083a7-26f1-424e-b5c7-ab4e081f1f98/swam-qesm/docker/kafka/prove1"


export test="test2_2"
echo "****TEST 1: "$test
export script_dir=$base_script_dir/$test
./runOneTest.sh
echo "****TEST 1: Sleep...."

sleep 240

export test="test5_2"
echo "****TEST 2: "$test
export script_dir=$base_script_dir/$test
./runOneTest.sh
echo "****TEST 2: Sleep...."

sleep 240

export test="test10_2"
echo "****TEST 3: "$test
export script_dir=$base_script_dir/$test
./runOneTest.sh
echo "****TEST 3: Sleep...."

sleep 240

export test="test15_2"
echo "****TEST 4: "$test
export script_dir=$base_script_dir/$test
./runOneTest.sh
echo "****TEST 4: Sleep...."

sleep 240

export test="test20_2"
echo "****TEST 5: "$test
export script_dir=$base_script_dir/$test
./runOneTest.sh
echo "****TEST 5: Sleep...."

sleep 240

export test="test25_2"
echo "****TEST 6: "$test
export script_dir=$base_script_dir/$test
./runOneTest.sh
echo "****TEST 6: Sleep...."

sleep 240

export test="test30_2"
echo "****TEST 7: "$test
export script_dir=$base_script_dir/$test
./runOneTest.sh
echo "****TEST 7: Sleep...."

sleep 240

export test="test35_2"
echo "****TEST 8: "$test
export script_dir=$base_script_dir/$test
./runOneTest.sh
echo "****TEST 8: Sleep...."

sleep 240

export test="test40_2"
echo "****TEST 9: "$test
export script_dir=$base_script_dir/$test
./runOneTest.sh
echo "****TEST 9: Sleep...."

sleep 240

export test="test50_2"
echo "****TEST 10: "$test
export script_dir=$base_script_dir/$test
./runOneTest.sh
echo "****TEST 10: End"
