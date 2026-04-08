package com.lavadero;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class LavaderoApplication {

    public static void main(String[] args) {
        SpringApplication.run(LavaderoApplication.class, args);
    }

}
