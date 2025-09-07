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

### config.js
Contiene i parametri di configurazione per il vari script come per esempio la lista dei broker, il nome del topic, il numero di partizioni e diversi parametri utilizzati dal produttore e dal consumatore (batchSize,batchTimeout,vus,iterations,maxDuration...)

### create_topic.js
Crea il topic indicato dal parametro "topic_string" con numero di partizioni pari a  "num_partition" presente nel file config.js

### delete_topic.js
Cancella il topic indicato dal parametro "topic_string" presente nel file config.js

### producer.js
Produce nmessaggi pari al parametro "writer_num_messages" nel topic indicato dal parametro "topic_string" parametri presenti nel file config.js

### consumer.js
Produce nmessaggi pari al parametro "reader_num_messages" nel topic indicato dal parametro "topic_string" parametri presenti nel file config.js




