package com.coursemong.back.gemini.config;

import com.google.genai.Client;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {
    @Bean
    public Client geminiClient() {
        // The client gets the API key from the environment variable `GOOGLE_API_KEY`.
        return new Client();
    }
}
