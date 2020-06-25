#/bin/bash
docker run --rm -it --network=host wurstmeister/kafka /opt/kafka/bin/kafka-streams-application-reset.sh \
  --input-topics input-text,input,output \
  --bootstrap-servers localhost:9092 \
  --application-id ${1:-streams-monitoring}
