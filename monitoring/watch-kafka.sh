#/bin/bash
./env/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic output \
  --from-beginning
#docker run --rm -it wurstmeister/kafka kafka-console-consumer.sh
