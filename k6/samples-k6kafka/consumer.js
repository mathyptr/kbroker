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

// load test config, used to populate exported options object:
const config = JSON.parse(open('./config/config.json'));
const brokers = config.brokers;
const topic = config.topic_string;
const nmsg = config.reader_num_messages;
const consumeLimit= config.reader_consumeLimit;
const reader_iterations = config.reader_iterations;
const evalPeriod = config.reader_evalPeriod;

const vus= config.writer_vus;
const iterations = config.writer_iterations;

const reader = new Reader({
  brokers: brokers,
  topic: topic,
});
const connection = new Connection({
  address: brokers[0],
});
const schemaRegistry = new SchemaRegistry();

export const options = {
  thresholds: {
    // Base thresholds to see reader is working
    kafka_reader_error_count: ["count == 0"],
  },
  scenarios: {
    test_scenario: {
    executor: 'shared-iterations',
    vus: vus, //  number of VUs fortest
    iterations: iterations, // number of iterations
    maxDuration: '20m',
   },
  },
};

export default function () {
 for ( let k=1; k <= reader_iterations ; k++) {
  let dateSart=new Date();
  for (let j = 0; j < nmsg ; j=j+consumeLimit) {
   let messages = reader.consume({ limit: consumeLimit });
   msgCountMisure.add(messages.length);
   console.log("Read messages: " + messages.length);
   console.log("Total Read messages: " + j);

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
  }
  let elapsed=new Date()-dateSart;
  console.log("Elapsed Time: " + elapsed + "(ms)");
  console.log("Iter num. " + k + " end at "+new Date());
  if(elapsed<evalPeriod) {
       console.log("Sleep for a while "+new Date());
       sleep((evalPeriod-elapsed)/1000)
       console.log("Wake up after sleep "+new Date());
  }
 }
}

export function teardown(data) {
  reader.close();
  connection.close();
}
