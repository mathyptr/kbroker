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
const nmsg = config.writer_num_messages;
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


export const options = {
  thresholds: {
    kafka_writer_error_count: ["count == 0"],
  },
};

let msg=[];

export default function () {
  for (let index = 0; index < nmsg; index++) {
    msg.push(
      {
        key: schemaRegistry.serialize({
          data: "swam-qesm-test-string-key",
          schemaType: SCHEMA_TYPE_STRING,
        }),
        value: schemaRegistry.serialize({
          data: "swam-qesm-test-string-value",
          schemaType: SCHEMA_TYPE_STRING,
        }),
        headers: {
          mykey: "swam-qesmvalue",
        },
        offset: index,
        partition: 0,
        time: new Date(), // timestamp
      },  
    );
//    console.log("Num msg product: "+index);
//    writer.produce({ messages: messages });
//    console.log("Num msg sent: "+index);
  }

    console.log(msg);
    writer.produce({ messages: msg });
}

export function teardown(data) {
  if (__VU == 0) {
//    connection.deleteTopic(topic);
  }
  writer.close();
  connection.close();
}
