import { check } from "k6";
// import kafka extension
import {
  Connection,
  SCHEMA_TYPE_BYTES,
} from "k6/x/kafka"; 


// load test config, used to populate exported options object:
const config = JSON.parse(open('./config/config_test.json'));
const brokers = config.brokers;
const topic = config.topic_string;

const connection = new Connection({
  address: brokers[0],
});

export default function () {
}

export function teardown(data) {
   if (__VU == 0) {
    connection.deleteTopic(topic);
  }
  else
    console.log("cannot delete TOPIC: VU!=0 !!!!!!!");
  connection.close();
}
