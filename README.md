# Test piattaforma di stream-processing 
Progetto per l'esame di Software Architecture and Methodologies (SWAM) e di Quantitative Evaluation of Stochastic Models (QESM) previsti dal corso di laurea magistrale in Ingegneria Informatica dell'Università degli Studi di Firenze.

### Quickstart
Lo scopo di questo progetto è il test di piattaforme di stream-processing.
In particolare è stata presa in considerazione la piattaforma Apache Kafka. In questo lavoro abbiamo configurato Kafka in modalità KRaft eliminando la necessità di utilizzare Zookeeper.

### Tecnologie utilizzate
- Apache Kafka
- InfluxDB
- Kafka-ui
- xk6-kafka
- Grafana
- Speedbump
- jmxtrans

## xk6-kafka
In questo container è presente xK6-kafka, ovvero una versione di k6 con il plugin per
effettuare i test su Kafka il quale fornisce diverse metriche. Mette infatti a disposizione funzionalità
per la scrittura e la lettura di messaggi, per la creazione di topics e per la loro cancellazione.

Sono stati realizzati i seguenti script per implementare le funzionalità del produttore e consumatore:

_config.json_
contiene i parametri di configurazione per i vari script come per esempio la lista dei broker, il nome del topic, il numero di partizioni e diversi parametri utilizzati dal produttore e dal consumatore (batchSize, batchTimeout, vus, iterations, maxDuration...)

_create_topic.js_
crea il topic indicato dal parametro "topic_string" con numero di partizioni pari a  "num_partition" presenti nel file config.js

_delete_topic.js_
cancella il topic indicato dal parametro "topic_string" presente nel file config.js

_producer.js_
scrive su Kafka un numero di messaggi pari al parametro "writer_num_messages" nel topic indicato dal parametro "topic_string" parametri presenti nel file config.js

_consumer.js_
legge da Kafka un numero di messaggi pari al parametro "reader_num_messages" nel topic indicato dal parametro "topic_string" parametri presenti nel file config.js


## Esecuzione script
Per eseguire uno script è sufficiente lanciare il seguente comando, avendo cura di montare la directory degli script in una directory del container:

_docker-compose run --rm -v /src_dir:/dest_dir k6-kafka run /dest_dir/script_js_

dove:

/src_dir  è il percorso sulla macchina host contenente gli script precedentemente illustrati

/dest_dir è il percorso di destinazione all'interno del container che conterrà gli script dopo l'operazione di mount

script_js è il nome, con estensione, di uno degli script precedentemente illustrati

## jmxtrans
jmxtrans è uno strumento software che consente di recuperare informazioni da applicazioni Java che utilizzano le Java Management Extensions (JMX), per poi esportarli verso altri servizi o sistemi di monitoring.

In questo lavoro le metriche che devono essere esportate da Kafka si trovano nel file jmxtrans\kafka.json e saranno memorizzate nel database InfluxDB.

## InfluxDB
Questo container si occupa della memorizzazione delle metriche esportate da Kafka tramite jmxtrans e delle metriche prodotte da xK6-kafka utilizzando appunto il database InfluDB.

InfluxDB è uno strumento open source all-in-one per la collezione, il monitoraggio ed il processamento di dati time series.

Per creare il database utilizzato in questo lavoro si può eseguire il seguente comando:

_curl -POST http://INFLUXDB_IP:8086/query --data-urlencode "q=CREATE DATABASE k6kafka"_

## Grafana
Grafana è una piattaforma interattiva open source per la visualizzazione dei dati sviluppata da Grafana Labs. Permette agli utenti di visualizzare i dati attraverso diagrammi e grafici unificati in una o più dashboard  per agevolarne la comprensione e l'interpretazione.
Consente inoltre di eseguire query e impostare avvisi sulle informazioni e sulle metriche a prescindere dall'ambiente in cui sono archiviati i dati.

In questo lavoro Grafana è stato utilizzato per visualizzare le metriche di Kafka, metriche prelevate dal datatabase InfluxDB alimentato da jmxtrans.

## Speedbump
Per simulare la latenza di rete in questo lavoro abbiamo utilizzato Speedbump. Gli script k6 di questo lavoro si connettono a speedbump il quale inoltra e chiamate a kafka.

Nel file config.js utilizzato dagli script k6 è presente il seguente parametro:
_"brokers" : ["speedbump:8000","speedbump2:8002","speedbump3:8003"]_

utilizzato come indirizzo per la connessione verso Kafka:

_const connection = new Connection({address: brokers[connectToBroker_index],})_

mentre speedbump viene eseguito con i seguenti parametri:

_speedbump : --latency=1000ms --sine-amplitude=1000ms --sine-period=1m --port=8000 kafka:9092_

_speedbump2: --latency=1000ms --sine-amplitude=1000ms --sine-period=1m --port=8002 kafka2:9092_

_speedbump3: --latency=1000ms --sine-amplitude=1000ms --sine-period=1m --port=8003 kafka3:9092_


## Kafka-UI
Kafka-UI è un'interfaccia web open source progettata per semplificare la gestione e il monitoraggio di Apache Kafka.

In questo lavoro Kafka-UI è stato utilizzato nella prima fase di test del funzionamento di Kafka e nella prima fase di realizzazione degli script xK6-kafka.

## Metriche
K6-KAFKA
| Metric                           | Type    | Description                                                             |
| -------------------------------- | ------- | ----------------------------------------------------------------------- |
| kafka_reader_dial_count          | Counter | Total number of times the reader tries to connect.                      |
| kafka_reader_fetches_count       | Counter | Total number of times the reader fetches batches of messages.           |
| kafka_reader_message_count       | Counter | Total number of messages consumed.                                      |
| kafka_reader_message_bytes       | Counter | Total bytes consumed.                                                   |
| kafka_reader_rebalance_count     | Counter | Total number of rebalances of a topic in a consumer group (deprecated). |
| kafka_reader_timeouts_count      | Counter | Total number of timeouts occurred when reading.                         |
| kafka_reader_error_count         | Counter | Total number of errors occurred when reading.                           |
| kafka_reader_dial_seconds        | Trend   | The time it takes to connect to the leader in a Kafka cluster.          |
| kafka_reader_read_seconds        | Trend   | The time it takes to read a batch of message.                           |
| kafka_reader_wait_seconds        | Trend   | Waiting time before read a batch of messages.                           |
| kafka_reader_fetch_size          | Counter | Total messages fetched.                                                 |
| kafka_reader_fetch_bytes         | Counter | Total bytes fetched.                                                    |
| kafka_reader_offset              | Gauge   | Number of messages read after the given offset in a batch.              |
| kafka_reader_lag                 | Gauge   | The lag between the last message offset and the current read offset.    |
| kafka_reader_fetch_bytes_min     | Gauge   | Minimum number of bytes fetched.                                        |
| kafka_reader_fetch_bytes_max     | Gauge   | Maximum number of bytes fetched.                                        |
| kafka_reader_fetch_wait_max      | Gauge   | The maximum time it takes to fetch a batch of messages.                 |
| kafka_reader_queue_length        | Gauge   | The queue length while reading batch of messages.                       |
| kafka_reader_queue_capacity      | Gauge   | The queue capacity while reading batch of messages.                     |
| kafka_writer_write_count         | Counter | Total number of times the writer writes batches of messages.            |
| kafka_writer_message_count       | Counter | Total number of messages produced.                                      |
| kafka_writer_message_bytes       | Counter | Total bytes produced.                                                   |
| kafka_writer_error_count         | Counter | Total number of errors occurred when writing.                           |
| kafka_writer_batch_seconds       | Trend   | The time it takes to write a batch of messages.                         |
| kafka_writer_batch_queue_seconds | Trend   | The time it takes to queue a batch of messages.                         |
| kafka_writer_write_seconds       | Trend   | The time it takes writing messages.                                     |
| kafka_writer_wait_seconds        | Trend   | Waiting time before writing messages.                                   |
| kafka_writer_retries_count       | Counter | Total number of attempts at writing messages.                           |
| kafka_writer_batch_size          | Counter | Total batch size.                                                       |
| kafka_writer_batch_bytes         | Counter | Total number of bytes in a batch of messages.                           |
| kafka_writer_attempts_max        | Gauge   | Maximum number of attempts at writing messages.                         |
| kafka_writer_batch_max           | Gauge   | Maximum batch size.                                                     |
| kafka_writer_batch_timeout       | Gauge   | Batch timeout.                                                          |
| kafka_writer_read_timeout        | Gauge   | Batch read timeout.                                                     |
| kafka_writer_write_timeout       | Gauge   | Batch write timeout.                                                    |
| kafka_writer_acks_required       | Gauge   | Required Acks.                                                          |
| kafka_writer_async               | Rate    | Async writer.                                                           |


KAFKA Producer
 Metric/Attribute name | Description | Mbean name
| -------------------------------- | ------- | ----------------------------------------------------------------------- |
batch-size-avg | The average number of bytes sent per partition per-request. | kafka.producer:type=producer-metrics,client-id="{client-id}"
batch-size-max | The max number of bytes sent per partition per-request. | kafka.producer:type=producer-metrics,client-id="{client-id}"
batch-split-rate | The average number of batch splits per second | kafka.producer:type=producer-metrics,client-id="{client-id}"
batch-split-total | The total number of batch splits | kafka.producer:type=producer-metrics,client-id="{client-id}"
compression-rate-avg | The average compression rate of record batches, defined as the average ratio of the compressed batch size over the uncompressed size. | kafka.producer:type=producer-metrics,client-id="{client-id}"
metadata-age | The age in seconds of the current producer metadata being used. | kafka.producer:type=producer-metrics,client-id="{client-id}"
produce-throttle-time-avg | The average time in ms a request was throttled by a broker | kafka.producer:type=producer-metrics,client-id="{client-id}"
produce-throttle-time-max | The maximum time in ms a request was throttled by a broker | kafka.producer:type=producer-metrics,client-id="{client-id}"
record-error-rate | The average per-second number of record sends that resulted in errors | kafka.producer:type=producer-metrics,client-id="{client-id}"
record-error-total | The total number of record sends that resulted in errors | kafka.producer:type=producer-metrics,client-id="{client-id}"
record-queue-time-avg | The average time in ms record batches spent in the send buffer. | kafka.producer:type=producer-metrics,client-id="{client-id}"
record-queue-time-max | The maximum time in ms record batches spent in the send buffer. | kafka.producer:type=producer-metrics,client-id="{client-id}"
record-retry-rate | The average per-second number of retried record sends | kafka.producer:type=producer-metrics,client-id="{client-id}"
record-retry-total | The total number of retried record sends | kafka.producer:type=producer-metrics,client-id="{client-id}"
record-send-rate | The average number of records sent per second. | kafka.producer:type=producer-metrics,client-id="{client-id}"
record-send-total | The total number of records sent. | kafka.producer:type=producer-metrics,client-id="{client-id}"
record-size-avg | The average record size | kafka.producer:type=producer-metrics,client-id="{client-id}"
record-size-max | The maximum record size | kafka.producer:type=producer-metrics,client-id="{client-id}"
records-per-request-avg | The average number of records per request. | kafka.producer:type=producer-metrics,client-id="{client-id}"
request-latency-avg | The average request latency in ms | kafka.producer:type=producer-metrics,client-id="{client-id}"
request-latency-max | The maximum request latency in ms | kafka.producer:type=producer-metrics,client-id="{client-id}"
requests-in-flight | The current number of in-flight requests awaiting a response. | kafka.producer:type=producer-metrics,client-id="{client-id}"
byte-rate | The average number of bytes sent per second for a topic. | kafka.producer:type=producer-topic-metrics,client-id="{client-id}",topic="{topic}"
byte-total | The total number of bytes sent for a topic. | kafka.producer:type=producer-topic-metrics,client-id="{client-id}",topic="{topic}"
compression-rate | The average compression rate of record batches for a topic, defined as the average ratio of the compressed batch size over the uncompressed size. | kafka.producer:type=producer-topic-metrics,client-id="{client-id}",topic="{topic}"
record-error-rate | The average per-second number of record sends that resulted in errors for a topic | kafka.producer:type=producer-topic-metrics,client-id="{client-id}",topic="{topic}"
record-error-total | The total number of record sends that resulted in errors for a topic | kafka.producer:type=producer-topic-metrics,client-id="{client-id}",topic="{topic}"
record-retry-rate | The average per-second number of retried record sends for a topic | kafka.producer:type=producer-topic-metrics,client-id="{client-id}",topic="{topic}"
record-retry-total | The total number of retried record sends for a topic | kafka.producer:type=producer-topic-metrics,client-id="{client-id}",topic="{topic}"
record-send-rate | The average number of records sent per second for a topic. | kafka.producer:type=producer-topic-metrics,client-id="{client-id}",topic="{topic}"
record-send-total | The total number of records sent for a topic. | kafka.producer:type=producer-topic-metrics,client-id="{client-id}",topic="{topic}"


KAFKA Consumer
 Metric/Attribute name | Description | Mbean name
| -------------------------------- | ------- | ----------------------------------------------------------------------- |
bytes-consumed-rate | The average number of bytes consumed per second | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
bytes-consumed-total | The total number of bytes consumed | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
fetch-latency-avg | The average time taken for a fetch request. | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
fetch-latency-max | The max time taken for any fetch request. | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
fetch-rate | The number of fetch requests per second. | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
fetch-size-avg | The average number of bytes fetched per request | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
fetch-size-max | The maximum number of bytes fetched per request | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
fetch-throttle-time-avg | The average throttle time in ms | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
fetch-throttle-time-max | The maximum throttle time in ms | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
fetch-total | The total number of fetch requests. | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
records-consumed-rate | The average number of records consumed per second | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
records-consumed-total | The total number of records consumed | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
records-lag-max | The maximum lag in terms of number of records for any partition in this window. NOTE: This is based on current offset and not committed offset | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
records-lead-min | The minimum lead in terms of number of records for any partition in this window | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
records-per-request-avg | The average number of records in each request | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}"
bytes-consumed-rate | The average number of bytes consumed per second for a topic | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}",topic="{topic}"
bytes-consumed-total | The total number of bytes consumed for a topic | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}",topic="{topic}"
fetch-size-avg | The average number of bytes fetched per request for a topic | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}",topic="{topic}"
fetch-size-max | The maximum number of bytes fetched per request for a topic | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}",topic="{topic}"
records-consumed-rate | The average number of records consumed per second for a topic | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}",topic="{topic}"
records-consumed-total | The total number of records consumed for a topic | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}",topic="{topic}"
records-per-request-avg | The average number of records in each request for a topic | kafka.consumer:type=consumer-fetch-manager-metrics,client-id="{client-id}",topic="{topic}"
preferred-read-replica | The current read replica for the partition, or -1 if reading from leader | kafka.consumer:type=consumer-fetch-manager-metrics,partition="{partition}",topic="{topic}",client-id="{client-id}"
records-lag | The latest lag of the partition | kafka.consumer:type=consumer-fetch-manager-metrics,partition="{partition}",topic="{topic}",client-id="{client-id}"
records-lag-avg | The average lag of the partition | kafka.consumer:type=consumer-fetch-manager-metrics,partition="{partition}",topic="{topic}",client-id="{client-id}"
records-lag-max | The max lag of the partition | kafka.consumer:type=consumer-fetch-manager-metrics,partition="{partition}",topic="{topic}",client-id="{client-id}"
records-lead | The latest lead of the partition | kafka.consumer:type=consumer-fetch-manager-metrics,partition="{partition}",topic="{topic}",client-id="{client-id}"
records-lead-avg | The average lead of the partition | kafka.consumer:type=consumer-fetch-manager-metrics,partition="{partition}",topic="{topic}",client-id="{client-id}"
records-lead-min | The min lead of the partition | kafka.consumer:type=consumer-fetch-manager-metrics,partition="{partition}",topic="{topic}",client-id="{client-id}"

Kafka Connect
 Metric/Attribute name | Description | Mbean name
connector-count | The number of connectors run in this worker. | kafka.connect:type=connect-worker-metrics
connector-startup-attempts-total | The total number of connector startups that this worker has attempted. | kafka.connect:type=connect-worker-metrics
connector-startup-failure-percentage | The average percentage of this worker's connectors starts that failed. | kafka.connect:type=connect-worker-metrics
connector-startup-failure-total | The total number of connector starts that failed. | kafka.connect:type=connect-worker-metrics
connector-startup-success-percentage | The average percentage of this worker's connectors starts that succeeded. | kafka.connect:type=connect-worker-metrics
connector-startup-success-total | The total number of connector starts that succeeded. | kafka.connect:type=connect-worker-metrics
task-count | The number of tasks run in this worker. | kafka.connect:type=connect-worker-metrics
task-startup-attempts-total | The total number of task startups that this worker has attempted. | kafka.connect:type=connect-worker-metrics
task-startup-failure-percentage | The average percentage of this worker's tasks starts that failed. | kafka.connect:type=connect-worker-metrics
task-startup-failure-total | The total number of task starts that failed. | kafka.connect:type=connect-worker-metrics
task-startup-success-percentage | The average percentage of this worker's tasks starts that succeeded. | kafka.connect:type=connect-worker-metrics
task-startup-success-total | The total number of task starts that succeeded. | kafka.connect:type=connect-worker-metrics
connector-destroyed-task-count | The number of destroyed tasks of the connector on the worker. | kafka.connect:type=connect-worker-metrics,connector="{connector}"
connector-failed-task-count | The number of failed tasks of the connector on the worker. | kafka.connect:type=connect-worker-metrics,connector="{connector}"
connector-paused-task-count | The number of paused tasks of the connector on the worker. | kafka.connect:type=connect-worker-metrics,connector="{connector}"
connector-restarting-task-count | The number of restarting tasks of the connector on the worker. | kafka.connect:type=connect-worker-metrics,connector="{connector}"
connector-running-task-count | The number of running tasks of the connector on the worker. | kafka.connect:type=connect-worker-metrics,connector="{connector}"
connector-total-task-count | The number of tasks of the connector on the worker. | kafka.connect:type=connect-worker-metrics,connector="{connector}"
connector-unassigned-task-count | The number of unassigned tasks of the connector on the worker. | kafka.connect:type=connect-worker-metrics,connector="{connector}"
completed-rebalances-total | The total number of rebalances completed by this worker. | kafka.connect:type=connect-worker-rebalance-metrics
connect-protocol | The Connect protocol used by this cluster | kafka.connect:type=connect-worker-rebalance-metrics
epoch | The epoch or generation number of this worker. | kafka.connect:type=connect-worker-rebalance-metrics
leader-name | The name of the group leader. | kafka.connect:type=connect-worker-rebalance-metrics
rebalance-avg-time-ms | The average time in milliseconds spent by this worker to rebalance. | kafka.connect:type=connect-worker-rebalance-metrics
rebalance-max-time-ms | The maximum time in milliseconds spent by this worker to rebalance. | kafka.connect:type=connect-worker-rebalance-metrics
rebalancing | Whether this worker is currently rebalancing. | kafka.connect:type=connect-worker-rebalance-metrics
time-since-last-rebalance-ms | The time in milliseconds since this worker completed the most recent rebalance. | kafka.connect:type=connect-worker-rebalance-metrics
connector-class | The name of the connector class. | kafka.connect:type=connector-metrics,connector="{connector}"
connector-type | The type of the connector. One of 'source' or 'sink'. | kafka.connect:type=connector-metrics,connector="{connector}"
connector-version | The version of the connector class, as reported by the connector. | kafka.connect:type=connector-metrics,connector="{connector}"
status | The status of the connector. One of 'unassigned', 'running', 'paused', 'stopped', 'failed', or 'restarting'. | kafka.connect:type=connector-metrics,connector="{connector}"
batch-size-avg | The average number of records in the batches the task has processed so far. | kafka.connect:type=connector-task-metrics,connector="{connector}",task="{task}"
batch-size-max | The number of records in the largest batch the task has processed so far. | kafka.connect:type=connector-task-metrics,connector="{connector}",task="{task}"
offset-commit-avg-time-ms | The average time in milliseconds taken by this task to commit offsets. | kafka.connect:type=connector-task-metrics,connector="{connector}",task="{task}"
offset-commit-failure-percentage | The average percentage of this task's offset commit attempts that failed. | kafka.connect:type=connector-task-metrics,connector="{connector}",task="{task}"
offset-commit-max-time-ms | The maximum time in milliseconds taken by this task to commit offsets. | kafka.connect:type=connector-task-metrics,connector="{connector}",task="{task}"
offset-commit-success-percentage | The average percentage of this task's offset commit attempts that succeeded. | kafka.connect:type=connector-task-metrics,connector="{connector}",task="{task}"
pause-ratio | The fraction of time this task has spent in the pause state. | kafka.connect:type=connector-task-metrics,connector="{connector}",task="{task}"
running-ratio | The fraction of time this task has spent in the running state. | kafka.connect:type=connector-task-metrics,connector="{connector}",task="{task}"
status | The status of the connector task. One of 'unassigned', 'running', 'paused', 'failed', or 'restarting'. | kafka.connect:type=connector-task-metrics,connector="{connector}",task="{task}"
offset-commit-completion-rate | The average per-second number of offset commit completions that were completed successfully. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
offset-commit-completion-total | The total number of offset commit completions that were completed successfully. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
offset-commit-seq-no | The current sequence number for offset commits. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
offset-commit-skip-rate | The average per-second number of offset commit completions that were received too late and skipped/ignored. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
offset-commit-skip-total | The total number of offset commit completions that were received too late and skipped/ignored. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
partition-count | The number of topic partitions assigned to this task belonging to the named sink connector in this worker. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
put-batch-avg-time-ms | The average time taken by this task to put a batch of sinks records. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
put-batch-max-time-ms | The maximum time taken by this task to put a batch of sinks records. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
sink-record-active-count | The number of records that have been read from Kafka but not yet completely committed/flushed/acknowledged by the sink task. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
sink-record-active-count-avg | The average number of records that have been read from Kafka but not yet completely committed/flushed/acknowledged by the sink task. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
sink-record-active-count-max | The maximum number of records that have been read from Kafka but not yet completely committed/flushed/acknowledged by the sink task. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
sink-record-lag-max | The maximum lag in terms of number of records that the sink task is behind the consumer's position for any topic partitions. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
sink-record-read-rate | The average per-second number of records read from Kafka for this task belonging to the named sink connector in this worker. This is before transformations are applied. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
sink-record-read-total | The total number of records read from Kafka by this task belonging to the named sink connector in this worker, since the task was last restarted. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
sink-record-send-rate | The average per-second number of records output from the transformations and sent/put to this task belonging to the named sink connector in this worker. This is after transformations are applied and excludes any records filtered out by the transformations. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
sink-record-send-total | The total number of records output from the transformations and sent/put to this task belonging to the named sink connector in this worker, since the task was last restarted. | kafka.connect:type=sink-task-metrics,connector="{connector}",task="{task}"
poll-batch-avg-time-ms | The average time in milliseconds taken by this task to poll for a batch of source records. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
poll-batch-max-time-ms | The maximum time in milliseconds taken by this task to poll for a batch of source records. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
source-record-active-count | The number of records that have been produced by this task but not yet completely written to Kafka. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
source-record-active-count-avg | The average number of records that have been produced by this task but not yet completely written to Kafka. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
source-record-active-count-max | The maximum number of records that have been produced by this task but not yet completely written to Kafka. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
source-record-poll-rate | The average per-second number of records produced/polled (before transformation) by this task belonging to the named source connector in this worker. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
source-record-poll-total | The total number of records produced/polled (before transformation) by this task belonging to the named source connector in this worker. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
source-record-write-rate | The average per-second number of records written to Kafka for this task belonging to the named source connector in this worker, since the task was last restarted. This is after transformations are applied, and excludes any records filtered out by the transformations. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
source-record-write-total | The number of records output written to Kafka for this task belonging to the named source connector in this worker, since the task was last restarted. This is after transformations are applied, and excludes any records filtered out by the transformations. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
transaction-size-avg | The average number of records in the transactions the task has committed so far. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
transaction-size-max | The number of records in the largest transaction the task has committed so far. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
transaction-size-min | The number of records in the smallest transaction the task has committed so far. | kafka.connect:type=source-task-metrics,connector="{connector}",task="{task}"
deadletterqueue-produce-failures | The number of failed writes to the dead letter queue. | kafka.connect:type=task-error-metrics,connector="{connector}",task="{task}"
deadletterqueue-produce-requests | The number of attempted writes to the dead letter queue. | kafka.connect:type=task-error-metrics,connector="{connector}",task="{task}"
last-error-timestamp | The epoch timestamp when this task last encountered an error. | kafka.connect:type=task-error-metrics,connector="{connector}",task="{task}"
total-errors-logged | The number of errors that were logged. | kafka.connect:type=task-error-metrics,connector="{connector}",task="{task}"
total-record-errors | The number of record processing errors in this task. | kafka.connect:type=task-error-metrics,connector="{connector}",task="{task}"
total-record-failures | The number of record processing failures in this task. | kafka.connect:type=task-error-metrics,connector="{connector}",task="{task}"
total-records-skipped | The number of records skipped due to errors. | kafka.connect:type=task-error-metrics,connector="{connector}",task="{task}"
total-retries | The number of operations retried. | kafka.connect:type=task-error-metrics,connector="{connector}",task="{task}"




Custom K6


