import { check } from "k6";
import { Counter } from 'k6/metrics';
import { sleep } from 'k6';
// import kafka extension
import {
  Reader,
  Connection,
  SchemaRegistry,
  SCHEMA_TYPE_STRING,
} from "k6/x/kafka"; // import kafka extension

const msgCountMisure = new Counter('custom_kafka_reader_msg_count');
const firstMsgTime   = new Counter('custom_kafka_reader_first_msg_time');

// load test config, used to populate exported options object:
const config = JSON.parse(open('./config/config.json'));
const brokers = config.brokers;
const connectToBroker_index = config.connectToBroker_index;
const topic = config.topic_string;
const nmsg = config.reader_num_messages;
const consumeLimit= config.reader_consumeLimit;
const repetitions = config.reader_repetitions;
const evalPeriod = config.reader_evalPeriod;
const checkM = config.reader_checkMsg;

const executor = config.reader_k6_executor;
const vus= config.reader_k6_vus;
const iterations = config.reader_k6_iterations;
const maxDuration = config.reader_k6_maxDuration;

const debug = config.debug

const reader = new Reader({
  brokers: brokers,
  topic: topic,
});
const connection = new Connection({
  address: brokers[connectToBroker_index],
});
const schemaRegistry = new SchemaRegistry();

export const options = {
  thresholds: {
    // Base thresholds to see reader is working
    kafka_reader_error_count: ["count == 0"],
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

function log(str){
    if (debug!=0)
        console.log(str);
};



function checkMsg(messages){
       check(messages, {
        " messages are received": (messages) => messages.length == consumeLimit,
       });
       check(messages[0], {
        "Topic equals to swam-qesm_topic": (msg) => msg["topic"] == topic,
        "Key is a string and is correct": (msg) =>
          schemaRegistry.deserialize({
            data: msg.key,
            schemaType: SCHEMA_TYPE_STRING,
          }) == "swam-qesm-test-string-key",
        "Value is a string and is correct": (msg) =>
          typeof schemaRegistry.deserialize({
            data: msg.value,
            schemaType: SCHEMA_TYPE_STRING,
          }) == "string" &&
          schemaRegistry.deserialize({
            data: msg.value,
            schemaType: SCHEMA_TYPE_STRING,
          }) == "swam-qesm-test-string-value",
        "Header equals {'mykey': 'swam-qesmvalue'}": (msg) =>
          "mykey" in msg.headers &&
          String.fromCharCode(...msg.headers["mykey"]) == "swam-qesmvalue",
        "Time is past": (msg) => new Date(msg["time"]) < new Date(),
        "Partition is zero": (msg) => msg["partition"] == 0,
        "Offset is gte zero": (msg) => msg["offset"] >= 0,
        "High watermark is gte zero": (msg) => msg["highWaterMark"] >= 0,
       });
};

export default function () {
 log("Connect to broker: "+brokers[connectToBroker_index]);
 for ( let k=1; k <= repetitions ; k++) {
  let dateSart=new Date();
  for (let j = 0; j < nmsg ; j=j+consumeLimit) {
   try {
       let messages = reader.consume({ limit: consumeLimit });
       if(messages.length!=0)
        firstMsgTime.add(new Date());
       msgCountMisure.add(messages.length);
       log("Read messages: " + messages.length);
       log("Total Read messages: " + j);
       if(checkM==1)
           checkMsg(messages);
   }
   catch (error) {
     log("this"+ this);
     log("error"+error);
     log("error.message"+error.message);
   }
  }
  let elapsed=new Date()-dateSart;
  log("Elapsed Time: " + elapsed + "(ms)");
  log("Iter num. " + k + " end at "+new Date());
  if(elapsed<evalPeriod) {
       log("Sleep for a while "+new Date());
       sleep((evalPeriod-elapsed)/1000)
       log("Wake up after sleep "+new Date());
  }
 }
}

export function teardown(data) {
  reader.close();
  connection.close();
}
