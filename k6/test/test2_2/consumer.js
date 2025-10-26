import { check } from "k6";
import { Counter } from 'k6/metrics';
import { sleep } from 'k6';

// import kafka extension
import {
  Reader, 
  SchemaRegistry,
  SCHEMA_TYPE_STRING,
} from "k6/x/kafka";

const msgCountMisure = new Counter('custom_kafka_reader_msg_count');
const firstMsgTime   = new Counter('custom_kafka_reader_first_msg_time');
const latency   = new Counter('custom_kafka_reader_latency');
const kafkaLatency   = new Counter('custom_kafka_reader_kafkaLatency');
const age   = new Counter('custom_kafka_reader_age');
const tps= new Counter('custom_kafka_reader_tp');

// load test config, used to populate exported options object:
const config = JSON.parse(open('./config/config.json'));
const brokers = config.brokers;
const connectToBroker_index = config.connectToBroker_index;
const topic = config.topic_string;
const groupID = config.groupID;
const num_partition=config.num_partition;

const nmsg = config.reader_num_messages;
const consumeLimit= config.reader_consumeLimit;
const repetitions = config.reader_repetitions;
const evalPeriod = config.reader_evalPeriod;
const checkM = config.reader_checkMsg;
const consumerVersion = config.reader_consumerVersion;
const debug = config.reader_debug;

const executor = config.reader_k6_executor;
const vus= config.reader_k6_vus;
const iterations = config.reader_k6_iterations;
const startTime=config.reader_k6_startTime;
const maxDuration = config.reader_k6_maxDuration;
const maxwait = config.reader_k6_maxwait;

const producerTimeOut= config.writer_batchTimeout;

let reader={};

if(num_partition>1)
	reader = new Reader({
		brokers: brokers,
		groupID: groupID,
		groupTopics: [topic],
		maxwait: maxwait
	});
else
	reader = new Reader({
		brokers: brokers,
		topic: topic,
		maxwait: maxwait
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
    startTime: startTime,
    maxDuration: maxDuration,
   },
  },
};

function log(str){
    if (debug)
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
        "High watermark is gte zero": (msg) => msg["highWaterMark"] >= 0,
       });
};


function readMsg_v0(){
 let msgtot=0;
 for ( let k=1; k <= repetitions ; k++) {
  let dateSart=new Date();
  for (let j = 0; j < nmsg ; j=j+consumeLimit) {
   try {
       let messages = reader.consume({ limit: consumeLimit });
       let lmsg=messages.length;
       if(lmsg!=0)
        firstMsgTime.add(new Date());
       msgCountMisure.add(lmsg);
       msgtot=msgtot+lmsg;
       log("Read messages: " + lmsg);
       log("Total Read messages: " + msgtot);
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
};

function readMsg_v1(){

 let msgtot=0;
 for ( let k=1;  ; k++) {
  let nm=0;
  let readnmsg=0;
  log("---Repeatition num: " + k + " start at "+new Date());
  let dateSart=new Date();
  try {
      let messages = reader.consume({ limit: 1 , expectTimeout : true,});
//      let messages = reader.consume({ limit: 1 });
      let ds=new Date();   
      if(messages.length!=0){
          let producerBuildTime= schemaRegistry.deserialize({
                      data: messages[0].key,
                      schemaType : SCHEMA_TYPE_STRING,
                    })
          let d=new Date();                    
          let l=d.getTime()-producerBuildTime;               
          latency.add(l);
          firstMsgTime.add(d);         

          if(l>=producerTimeOut)
            kafkaLatency.add(l-producerTimeOut);
          else
            kafkaLatency.add(l);

          readnmsg=parseInt(schemaRegistry.deserialize({
                      data: messages[0].value,
                      schemaType:  SCHEMA_TYPE_STRING,
                    }));
          log("Producer Build Time (ms): "+producerBuildTime);
          log("Consumer Read Time (ms): "+d.getTime());
          log("latency (ms): "+(d.getTime()-producerBuildTime));          
          log("Consumer Time: "+d);
          log("Max nmsg: " + readnmsg);

          nm=nm+1;         
          d=new Date();
          age.add(d.getTime()-producerBuildTime);
          if(readnmsg>1){
             try {
                 let messages = reader.consume({ limit:readnmsg-1, expectTimeout : true, });
                 log("tp: " + (new Date()-d));
                 tps.add(1000*messages.length/(new Date()-d));
                 for(let j=0;j<readnmsg-1;j++){
                    let producerBuildTime= schemaRegistry.deserialize({
                         data: messages[j].key,
                         schemaType : SCHEMA_TYPE_STRING,
                       })
                    let d=new Date();                    
                    age.add(d.getTime()-producerBuildTime);
                 }
                 nm=nm+messages.length;
                 msgtot=msgtot+nm;
                 msgCountMisure.add(msgtot);
                 log("Msg read/Total Msg read: "+nm+"/" + msgtot);                 
             }
             catch (error) {
                 log("***this "+ this);
                 log("***error "+error);
                 log("***error.message "+error.message);
                 log("***Msg read: "+messages.length);
             }
          }
      }
  }
  catch (error) {
     log("***Error: error.message "+error.message);
  }
  let elapsed=new Date()-dateSart;
  log("Elapsed Time: " + elapsed + "(ms)");
  log("---Iter num. " + k + " end at "+new Date());
 }
};


export default function () {
 log("Connect to broker: "+brokers[connectToBroker_index]);

 if(consumerVersion==0)
    readMsg_v0();
 else
    readMsg_v1();
}

export function teardown(data) {
  reader.close();
}
