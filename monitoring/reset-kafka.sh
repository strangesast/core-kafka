#/bin/bash
./env/bin/kafka-streams-application-reset.sh \
  --input-topics input,output \
  --bootstrap-servers localhost:9092 \
  --application-id streams-monitoring
#  --dry-run
