from wurstmeister/kafka

run mkdir -p /opt/kafka/plugins && \
  wget -P /opt/kafka/plugins https://packages.confluent.io/maven/io/confluent/kafka-connect-jdbc/5.5.0/kafka-connect-jdbc-5.5.0.jar && \
  wget -P /opt/kafka/plugins https://jdbc.postgresql.org/download/postgresql-42.2.13.jar

copy kafka-connect/*.properties ./

env CLASSPATH=/opt/kafka/plugins/postgresql-42.2.13.jar

entrypoint ["/opt/kafka/bin/connect-standalone.sh", "worker.properties", "machine_state.properties", "machine_values.properties"]
