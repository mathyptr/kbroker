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

### xk6-kafka
In questo container è presente xK6-kafka, ovvero una versione di k6 con il plugin per
effettuare i test su Kafka il quale fornisce diverse metriche. Mette infatti a disposizione funzionalità
per la scrittura e la lettura di messaggi, per la creazione di topics e per la loro cancellazione.
Sono stat realizzati i seguenti script per implementare le funzionalità del produttore e consumatore:
