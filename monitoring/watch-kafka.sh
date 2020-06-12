#/bin/bash
# --from-beginning \
# --property print.timestamp=true \
docker run --rm -it --network=host wurstmeister/kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic ${1:-input}
