package com.coursemong.back.gemini;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiApiClient {

    private final Client client;

    @Retryable(
            retryFor = {Exception.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 2000, multiplier = 2, random = true)
    )
    public String callGemini(String promptJson, GenerateContentConfig config) {
        try {
            GenerateContentResponse response = client.models.generateContent(
                    "gemini-2.5-flash-lite",
                    promptJson,
                    config
            );
            return response.text().trim();
        } catch (Exception e) {
            log.warn("제미나이 API 호출 실패 (재시도 예정): {}", e.getMessage());
            throw new RuntimeException("제미나이 API 호출 실패: " + e.getMessage(), e);
        }
    }
}
