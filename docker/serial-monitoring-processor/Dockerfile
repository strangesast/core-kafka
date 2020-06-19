from gradle as build

workdir /home/gradle/src

copy serial-monitoring-processor/build.gradle serial-monitoring-processor/settings.gradle serial-monitoring-processor/gradlew serial-monitoring-processor/gradle ./
RUN gradle build --no-daemon || return 0 

copy serial-monitoring-processor /home/gradle/src
run gradle build --no-daemon

from openjdk

workdir /app
copy --from=build /home/gradle/src/build/libs/*.jar /app/

entrypoint ["java", "-jar", "serial-monitoring-1.0-SNAPSHOT-all.jar"]
