import { check } from "k6";
// import kafka extension
import {
  Writer,
  Connection,
  SchemaRegistry,
  SCHEMA_TYPE_STRING,
} from "k6/x/kafka"


const brokers = ["kafka:9092"];
const topic = "swam-qesm_topic";


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
