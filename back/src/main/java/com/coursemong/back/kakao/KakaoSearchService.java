package com.coursemong.back.kakao;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class KakaoSearchService {

    @Value("${KAKAO_REST_API_KEY}")
    private String kakaoRestApiKey;

    public String searchPlaces(String query, int page, int size) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoRestApiKey);
            headers.set("KA", "sdk/v2 os/javascript lang/ko device/web origin/http://localhost:8080");

            HttpEntity<?> entity = new HttpEntity<>(headers);

            String apiUrl = "https://dapi.kakao.com/v2/local/search/keyword.json"
                    + "?query=" + query
                    + "&page=" + page
                    + "&size=" + size;

            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.GET, entity, String.class);

            return response.getBody();
        } catch (Exception e) {
            return "카카오 검색 API 호출 실패: " + e.getMessage();
        }
    }
}
