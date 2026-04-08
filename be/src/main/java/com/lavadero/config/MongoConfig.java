package com.lavadero.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.lavadero.repository")
@EnableMongoAuditing
public class MongoConfig {
    // Virtual Threads are automatically enabled via application.properties
    // spring.threads.virtual.enabled=true
}
