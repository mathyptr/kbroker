import { check } from "k6";
// import kafka extension
import {
  Writer,
  Reader,
  Connection,
  SchemaRegistry,
  SCHEMA_TYPE_BYTES,
} from "k6/x/kafka"; 

const brokers = ["kafka:9092"];
const topic = "swam-qesm_topic";

const writer = new Writer({
  brokers: brokers,
  topic: topic,
  autoCreateTopic: true,
});

const connection = new Connection({
  address: brokers[0],
});
const schemaRegistry = new SchemaRegistry();

if (__VU == 0) {
  connection.createTopic({ topic: topic });
}

const payload = "test swam-qesm SCHEMA_TYPE_BYTES payload";

export default function () {
  for (let index = 0; index < 100; index++) {
    let messages = [
      {
        key: schemaRegistry.serialize({
          data: Array.from("swam-qesm-" + index, (x) => x.charCodeAt(0)),
          schemaType: SCHEMA_TYPE_BYTES,
        }),
        value: schemaRegistry.serialize({
          data: Array.from(payload, (x) => x.charCodeAt(0)),
          schemaType: SCHEMA_TYPE_BYTES,
        }),
      },
    ];

    writer.produce({
      messages: messages,
    });
  }
}

export function teardown(data) {
  if (__VU == 0) {
    connection.deleteTopic(topic);
  }
  writer.close();
  connection.close();
}
