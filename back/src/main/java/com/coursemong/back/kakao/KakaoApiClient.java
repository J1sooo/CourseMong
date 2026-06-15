package com.coursemong.back.kakao;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class KakaoApiClient {

    @Value("${KAKAO_REST_API_KEY}")
    private String kakaoRestApiKey;

    @Value("${kakao.origin}")
    private String kakaoOrigin;

    @Retryable(
            retryFor = {Exception.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 2000, multiplier = 2, random = true)
    )
    public String search(String apiUrl) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoRestApiKey);
            headers.set("KA", "sdk/v2 os/javascript lang/ko device/web origin/" + kakaoOrigin);

            HttpEntity<?> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.GET, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            log.warn("카카오 API 호출 실패 (재시도 예정): {}", e.getMessage());
            throw new RuntimeException("카카오 API 호출 실패: " + e.getMessage(), e);
        }
    }
}
