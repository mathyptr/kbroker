import { check } from "k6";
// import kafka extension
import {
  Connection,
  SchemaRegistry,
} from "k6/x/kafka"


// load test config, used to populate exported options object:
const config = JSON.parse(open('./config/config.json'));


const num_partition=Number.parseInt(config.num_partition ?? "1");
//const num_partition=config.num_partition;
console.log("Num partition: "+num_partition);

const repFactor=Number.parseInt(config.replicationFactor ?? "1");
//const replicationFactor=config.replicationFactor;
console.log("ReplicationFactor: "+repFactor)


const brokers = config.brokers;
const connectToBroker_index = config.connectToBroker_index;
const topic = config.topic_string;

const connection = new Connection({
  address: brokers[connectToBroker_index],
});


if (__VU == 0) {
  connection.createTopic({ 
    topic: topic,
    numPartitions: num_partition,
    replicationFactor: repFactor,
 });
}

export default function () {
}

export function teardown(data) {
  connection.close();
}
