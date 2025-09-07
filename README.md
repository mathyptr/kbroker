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


