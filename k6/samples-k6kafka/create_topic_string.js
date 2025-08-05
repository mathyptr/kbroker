import { check } from "k6";
// import kafka extension
import {
  Writer,
  Connection,
  SchemaRegistry,
  SCHEMA_TYPE_STRING,
} from "k6/x/kafka"


// load test config, used to populate exported options object:
const config = JSON.parse(open('./config/config_test.json'));
const brokers = config.brokers;
const topic = config.topic_string;

const connection = new Connection({
  address: brokers[0],
});

if (__VU == 0) {
  connection.createTopic({ topic: topic });
}

export default function () {
}

export function teardown(data) {
  connection.close();
}
