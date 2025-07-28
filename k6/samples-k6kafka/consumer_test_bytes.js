import { check } from "k6";
// import kafka extension
import {
  Reader,
  Connection,
  SchemaRegistry,
  SCHEMA_TYPE_BYTES,
} from "k6/x/kafka"; 

const brokers = ["kafka:9092"];
const topic = "swam-qesm_topic_test_byte";

const reader = new Reader({
  brokers: brokers,
  topic: topic,
});
const connection = new Connection({
  address: brokers[0],
});
const schemaRegistry = new SchemaRegistry();


const payload = "test swam-qesm SCHEMA_TYPE_BYTES payload";

export default function () {
  let messages = reader.consume({ limit: 10 });
  check(messages, {
    "10 messages returned": (msgs) => msgs.length == 10,
    "key starts with 'swam-qesm-' string": (msgs) =>
      String.fromCharCode(
        ...schemaRegistry.deserialize({
          data: msgs[0].key,
          schemaType: SCHEMA_TYPE_BYTES,
        }),
      ).startsWith("swam-qesm-"),
    "value is correct": (msgs) =>
      String.fromCharCode(
        ...schemaRegistry.deserialize({
          data: msgs[0].value,
          schemaType: SCHEMA_TYPE_BYTES,
        }),
      ) == payload,
  });
}

export function teardown(data) {
  reader.close();
  connection.close();
}
