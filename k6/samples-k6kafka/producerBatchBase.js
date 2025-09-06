import { check } from "k6";
import { sleep } from 'k6';
// import kafka extension
import {
  Writer,
  Connection,
  SchemaRegistry,
  SCHEMA_TYPE_STRING,
} from "k6/x/kafka"


// load test config, used to populate exported options object:
const config = JSON.parse(open('./config/config.json'));
const brokers = config.brokers;
const topic = config.topic_string;
const headers_key = config.headers_key
const msg_key_string = config.msg_key_string;
const msg_value_string = config.msg_value_string;
const nmsg = config.writer_num_messages;
const batchSize= config.writer_batchSize;
const batchBytes= config.writer_batchBytes;
const batchTimeout= config.writer_batchTimeout;
const writeTimeout= config.writer_writeTimeout;
const numBurstExec= config.writer_numBurstExec;
const sleep_till_next_cycle= config.sleep_till_next_cycle;

const writer = new Writer({
  brokers: brokers,
  topic: topic,
  batchSize: batchSize,
//  batchBytes: batchBytes,
  batchTimeout: batchTimeout,
//  writeTimeout: writeTimeout
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
  scenarios: {
    test_scenario: {
    executor: 'shared-iterations',
    vus: 1, //  number of VUs fortest
    iterations: 1, // number of iterations
    maxDuration: '20m',
  },
},
};


export default function () {
   let msg=[];
   let i = 0;
   let j = 0;  
   while ( i < nmsg) {
    msg=[];
    for (j = 0; j < batchSize*3 && i+j < nmsg ; j++) {
     msg.push(
      {
        key: schemaRegistry.serialize({
          data: msg_key_string, // msg key
          schemaType: SCHEMA_TYPE_STRING,
        }),
        value: schemaRegistry.serialize({
          data: msg_value_string, // msg value
          schemaType: SCHEMA_TYPE_STRING,
        }),
        headers: {
          mykey: headers_key,
        },
        time: new Date(), // timestamp
      },  
     );
    }
    i=i+j;
    console.log("Sending messages... " + j + " at "+new Date());
    writer.produce({ messages: msg });
    console.log("Messages sent: " + j + " at "+new Date());
   } 
}

export function teardown(data) {
  if (__VU == 0) {
//    connection.deleteTopic(topic);
  }
  writer.close();
  connection.close();
}
