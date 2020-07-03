from arm32v7/gradle as build

workdir /home/gradle/src
copy --chown=gradle:gradle kafka-streams /home/gradle/src
run gradle build --no-daemon

from adoptopenjdk

workdir /app
copy --from=build /home/gradle/src/build/libs/*.jar /app/

entrypoint ["java", "-jar", "serial-monitoring-1.0-SNAPSHOT-all.jar"]
