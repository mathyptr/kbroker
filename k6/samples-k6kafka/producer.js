import { check } from "k6";
import { Counter } from 'k6/metrics';
import { sleep } from 'k6';
// import kafka extension
import {
  Writer,
  Connection,
  SchemaRegistry,
  SCHEMA_TYPE_STRING,
} from "k6/x/kafka"


const msgCountMisure = new Counter('custom_kafka_writer_msg_count');
const msgSentMisure = new Counter('custom_kafka_writer_msg');
const totalProduceRequest = new Counter('custom_kafka_writer_totalProduceRequest');
const firstMsgTime = new Counter('custom_kafka_writer_first_msg_time');

// load test config, used to populate exported options object:
const config = JSON.parse(open('./config/config.json'));
const brokers = config.brokers;
const connectToBroker_index = config.connectToBroker_index;
const topic = config.topic_string;
const headers_key = config.headers_key;
const msg_key_string = config.msg_key_string;
const msg_value_string = config.msg_value_string;
const num_partition=config.num_partition;
const batchSize= config.writer_batchSize;
const batchBytes= config.writer_batchBytes;
const timeOut= config.writer_batchTimeout;
const writeTimeout= config.writer_writeTimeout;
const numBurstExec= config.writer_numBurstExec;
const evalPeriod= config.writer_evalPeriod;
const distr_va = config.writer_distr_va;
const produceVersion = config.writer_produceVersion;
const nmsg_test = config.writer_num_messages;
const unitIntervalTime = config.unitIntervalTime;

const executor = config.writer_k6_executor;
const vus= config.writer_k6_vus;
const iterations = config.writer_k6_iterations;
const maxDuration = config.writer_k6_maxDuration;

const debug = config.debug;

let   batchTimeout=0;

if (produceVersion == 0) {
  batchTimeout=timeOut;

}


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


function log(str){
    if (debug!=0)
        console.log(str);
};


function distrVA(){
    return Math.floor(Math.random() * batchSize*num_partition-1);
};

function getNumMsg(){
    let n=0;
    if(distr_va==0)
        n= nmsg_test;
    else
        if (Math.round(Math.random()))
            n=batchSize*num_partition;
        else
            n=distrVA();
      log("numMsg: " + n);
     return n;
};


function buildMsg_v0(nmaxmsg){
    let msg=[];
    let t=0;
    let lambda = nmaxmsg;

    for (let j = 0; j < batchSize*num_partition && j < nmaxmsg ; j++) {
     let u=Math.floor(Math.random() * lambda)+1;
     t=t+Math.log(u)/lambda;   
     let ts=new Date();
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
        time: ts, // timestamp
      },  
     );
    if(j==0)
        firstMsgTime.add(ts);
    }
    log("timeToBuildMsg: " + t);
    return [msg,t];
};


function buildMsg_v1(nmaxmsg){
    let msg=[];
    let t=0;
    let baseTime = new Date();
    let d= new Date();
    for (let j = 0; j < batchSize*num_partition ; j++) {
     t=t-Math.log(Math.random())/1000;   
     if(t>timeOut){
        t=timeOut;
        break;
     }
     else{

         d.setSeconds(baseTime.getSeconds()+t);
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
            time: d, // timestamp
          },  
         );
         if(j==0)
            firstMsgTime.add(d);
     }
    }
    log("timeToBuildMsg: " + d);

    baseTime=d;
    return [msg,t];
};



function produceMsg(nmaxmsg){
    let msg=[];
    let t=0;

    if(produceVersion==0)
        [msg,t]=buildMsg_v0(nmaxmsg);
    else
        [msg,t]=buildMsg_v1(nmaxmsg);

    return [msg,t];
};


function timeToBuildMsg(lambda){
    let t=0;
    for (let i = 0;i < lambda ; i++) {
        let u=Math.floor(Math.random() * lambda)+1;
        t=t+Math.log(u)/lambda;   
    }
    log("timeToBuildMsg: " + t);
    return t;
};

function writeMsg(msg){
    let nmsgProduct=msg.length;
    log("Sending messages... " + nmsgProduct + " at "+new Date());
    writer.produce({ messages: msg });
    msgSentMisure.add(nmsgProduct);
    log("Messages sent: " + nmsgProduct + " at "+new Date());
};


function getSomeSleep(dateSart){
   let elapsed=new Date()-dateSart;
   log("Elapsed Time: " + elapsed + "(ms)");
   if(elapsed<evalPeriod) {
       log("Sleep for a while "+new Date());
       sleep((evalPeriod-elapsed)/1000)
       log("Wake up after sleep "+new Date());
   }
}

export default function () {
  log("Connect to broker: "+brokers[connectToBroker_index]);  
  let z = 0;    
  for ( let k=1; k <= numBurstExec ; k++) {
   log("Burst num: " + k + " start at "+new Date());

   let nmsg=getNumMsg();
   let dateSart=new Date();
   let msg=[];
   let t=0;

   [msg,t]=produceMsg(nmsg);

   sleep(t*unitIntervalTime);
   writeMsg(msg );
   z=z+1;
   msgCountMisure.add(nmsg);
   totalProduceRequest.add(z);

   getSomeSleep(dateSart);

   log("Burst num. " + k + " end at "+new Date());
 }
}

export function teardown(data) {
  if (__VU == 0) {
//    connection.deleteTopic(topic);
  }
  writer.close();
  connection.close();
}
