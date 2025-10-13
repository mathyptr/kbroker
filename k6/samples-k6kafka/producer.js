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
const timeOut= config.writer_batchTimeout;
const numBurstExec= config.writer_numBurstExec;
const evalPeriod= config.writer_evalPeriod;
const distr_va = config.writer_distr_va;
const produceVersion = config.writer_produceVersion;
const nmsg_test = config.writer_num_messages;
const debug = config.writer_debug;


const unitIntervalTime = config.unitIntervalTime;

const executor = config.writer_k6_executor;
const vus= config.writer_k6_vus;
const iterations = config.writer_k6_iterations;
const maxDuration = config.writer_k6_maxDuration;

//const debug = config.debug.replaceAll("True","true").replaceAll("False","false")

let   batchTimeout=0;

if (produceVersion == 0) {
  batchTimeout=timeOut;

}

//const numBurstExec = null ?? 1;

const writer = new Writer({
  brokers: brokers,
  topic: topic,
  batchSize: batchSize,
  batchTimeout: batchTimeout,
  maxwait: '10s'
});


const schemaRegistry = new SchemaRegistry();


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

function samplePoisson(lambda){
    let l=Math.exp(-lambda);
    log("+++L= " + l);
    let k=0;
    let p=1;
    do{
        k++;
        p = p* Math.random();
    } while (p>l);
    return k-1;
};

function distrVA(nmsg_test){
//    return Math.floor(Math.random() * batchSize*num_partition-1);
//      return samplePoisson(batchSize*num_partition);
      return samplePoisson(nmsg_test);
};

function getNumMsg(){
    let n=0;
    if(distr_va==0)
        n= nmsg_test;
    else
        n=distrVA(nmsg_test);
        log("+++numMsg calculated using distr VA on "+ nmsg_test+" : "+n);
/*        if (Math.round(Math.random())){
            n=batchSize*num_partition;
            log("+++numMsg: " + n);
        }
        else{
            n=distrVA(nmsg_test);
            log("+++numMsg calculated using distr VA: "+n);
        }
*/
    return n;
};


function buildMsg_v0(nmaxmsg){
    let msg=[];
    let t=0;
    let lambda = nmaxmsg;
    let i=0;
     while ( i < nmaxmsg) {
        for (let j = 0; j < batchSize*num_partition && j < nmaxmsg-i ; j++) {
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
         if(j==0 && i==0)
            firstMsgTime.add(ts);
        }
        i=i+msg.length;
    }
    log("timeToBuildMsg: " + t);
    return [msg,t];
};


function buildMsg_v1(nmaxmsg){
    let msg=[];
    let timesMsg=[];
    let t=0;
    let endmsg=false
    let j = 0;
    while( j < batchSize*num_partition && endmsg!=true) {

     t=t-Math.log(Math.random());   
     if(t>timeOut){
        t=timeOut;
        log("TIMEOUT t: " + t);
        endmsg=true;
     }

     if(j<nmaxmsg){        
         timesMsg[j]=t;
         j=j+1;
     }
     else{
        t=timeOut;
        log("TIMEOUT t: " + t);
        endmsg=true;
     }

    }
    log("time t: " + t);
    let baseTime = new Date();
    let d= new Date();

    let nm=j;
    for(j=0;j<nm;j++){
         let dmsg= new Date();
         d.setSeconds(baseTime.getSeconds()+timesMsg[j]);
         msg.push(
          {
            key: schemaRegistry.serialize({
              data: (dmsg.getTime()).toString(), 
              schemaType: SCHEMA_TYPE_STRING,
            }),
            value: schemaRegistry.serialize({
              data: nm.toString(), // msg value
              schemaType: SCHEMA_TYPE_STRING,
            }),
            headers: {
              mykey: headers_key,
            },
            time: d, // timestamp

          },  
         );
         if(j==0){
            firstMsgTime.add(dmsg);  
            log("firstMsg Milliseconds   : " + dmsg.getTime());
            log("firstMsg Milliseconds VA: " + msg[0]['time']);
         }
    }
    d.setSeconds(baseTime.getSeconds()+timesMsg[nm-1]);
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

function writeMsg(msg){
    let nmsgProduct=msg.length;
    log("--->Sending messages...: " + nmsgProduct + " at "+new Date());
//    writer.produce({ messages: msg, expectTimeout : true });
    writer.produce({ messages: msg});
    msgSentMisure.add(nmsgProduct);
    log("--->Messages sent...   : " + nmsgProduct + " at "+new Date());
};


function getSomeSleep(dateSart){
   let elapsed=new Date()-dateSart;
   log("Elapsed Time: " + elapsed + "(ms)");
   if(elapsed<evalPeriod) {
       log("***Sleep for a while "+new Date());
       sleep((evalPeriod-elapsed)/1000)
       log("***Wake up after sleep "+new Date());
   }
}

export default function () {
  log("Connect to broker: "+brokers[connectToBroker_index]);  
  let z = 0;    
  let msgtot = 0;    
  for ( let k=1; k <= numBurstExec ; k++) {
   log("###Burst num: " + k + " start at "+new Date());

   let nmsg=getNumMsg();
   let dateSart=new Date();
   let msg=[];
   let t=0;

   [msg,t]=produceMsg(nmsg);
   log("***Start sleep for " +t*unitIntervalTime+" to simulate Distr VA: "+new Date());
   sleep(t*unitIntervalTime);
   log("***End   sleep for " +t*unitIntervalTime+" to simulate Distr VA: "+new Date());
   writeMsg(msg);
   z=z+1;
   msgtot=msgtot+msg.length;
   log("numMsg Sent: " + msg.length);
   log("Total numMsg Sent: " + msgtot);
   msgCountMisure.add(msgtot);
   totalProduceRequest.add(z);

   getSomeSleep(dateSart);

   log("###Burst num. " + k + " end at "+new Date());
 }
}

export function teardown(data) {
  writer.close();
}
