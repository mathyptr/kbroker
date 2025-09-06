import { check } from "k6";
// import kafka extension
import {
  Writer,
  Connection,
  SchemaRegistry,
  SCHEMA_TYPE_BYTES,
} from "k6/x/kafka"; 


// load test config, used to populate exported options object:
const config = JSON.parse(open('./config/config_test.json'));
const brokers = config.brokers;
const topic = config.topic_byte;
const nmsg = config.num_messages;
const batchSize= config.writer_batchSize;
const batchBytes= config.writer_batchBytes;
const batchTimeout= config.writer_batchTimeout;
const writeTimeout= config.writer_writeTimeout;

const writer = new Writer({
  brokers: brokers,
  topic: topic,
  batchSize: batchSize,
  batchBytes: batchBytes,
  batchTimeout: batchTimeout,
  writeTimeout: writeTimeout
//  autoCreateTopic: true,
});


const connection = new Connection({
  address: brokers[0],
});
const schemaRegistry = new SchemaRegistry();

/*
if (__VU == 0) {
  connection.createTopic({ topic: topic });
}
*/

const payload = "test swam-qesm SCHEMA_TYPE_BYTES payload";

export default function () {
  for (let index = 0; index < nmsg; index++) {
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
//    connection.deleteTopic(topic);
  }
  writer.close();
  connection.close();
}
