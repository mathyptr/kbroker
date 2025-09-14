# Test piattaforma di stream-processing 
Progetto per l'esame di Software Architecture and Methodologies (SWAM) e di Quantitative Evaluation of Stochastic Models (QESM) previsti dal corso di laurea magistrale in Ingegneria Informatica dell'Università degli Studi di Firenze.

### Quickstart
Lo scopo di questo progetto è il test di piattaforme di stream-processing.
In particolare è stata presa in considerazione la piatafforma Apache Kafka.

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

_config.js_
contiene i parametri di configurazione per i vari script come per esempio la lista dei broker, il nome del topic, il numero di partizioni e diversi parametri utilizzati dal produttore e dal consumatore (batchSize, batchTimeout, vus, iterations, maxDuration...)

_create_topic.js_
crea il topic indicato dal parametro "topic_string" con numero di partizioni pari a  "num_partition" presenti nel file config.js

_delete_topic.js_
cancella il topic indicato dal parametro "topic_string" presente nel file config.js

_producer.js_
ccrive su Kafka un numero di messaggi pari al parametro "writer_num_messages" nel topic indicato dal parametro "topic_string" parametri presenti nel file config.js

_consumer.js_
cegge da Kafka un numero di messaggi pari al parametro "reader_num_messages" nel topic indicato dal parametro "topic_string" parametri presenti nel file config.js


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
