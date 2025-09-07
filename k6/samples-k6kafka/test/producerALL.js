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
const connectToBroker_index = config.connectToBroker_index;
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
const evalPeriod= config.writer_evalPeriod;

const executor = config.writer_k6_executor;
const vus= config.writer_k6_vus;
const iterations = config.writer_k6_iterations;
const maxDuration = config.writer_k6_maxDuration;
//const numBurstExec = null ?? 1;


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
  address: brokers[connectToBroker_index],
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
    executor: executor,
    vus: vus, //  number of VUs fortest
    iterations: iterations, // number of iterations
    maxDuration: maxDuration,
  },
},
};



export default function () {
  for ( let k=1; k <= numBurstExec ; k++) {
   let dateSart=new Date();
   let msg=[];
   console.log("Burst num. " + k + " start at "+new Date());
   for ( let i = 0; i < nmsg ; i++) {
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
   console.log("Sending messages... " + nmsg + " at "+new Date());
   writer.produce({ messages: msg });
   let elapsed=new Date()-dateSart;
   console.log("Elapsed Time: " + elapsed + "(ms)");
   console.log("Messages sent: " + nmsg + " at "+new Date());
   console.log("Burst num. " + k + " end at "+new Date());
   if(elapsed<evalPeriod) {
       console.log("Sleep for a while "+new Date());
       sleep((evalPeriod-elapsed)/1000)
       console.log("Wake up after sleep "+new Date());
   }
 }
}

export function teardown(data) {
  if (__VU == 0) {
//    connection.deleteTopic(topic);
  }
  writer.close();
  connection.close();
}
