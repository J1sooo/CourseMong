package com.coursemong.back.kakao;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoSearchService {

    private final KakaoApiClient kakaoApiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<KakaoPlaceDto> searchPlaces(String query, int page, int size) {
        try {
            String apiUrl = "https://dapi.kakao.com/v2/local/search/keyword.json"
                    + "?query=" + query
                    + "&page=" + page
                    + "&size=" + size;

            String responseBody = kakaoApiClient.search(apiUrl);

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode documents = root.get("documents");

            List<KakaoPlaceDto> places = new ArrayList<>();
            for (JsonNode doc : documents) {
                places.add(objectMapper.treeToValue(doc, KakaoPlaceDto.class));
            }

            return places;
        } catch (Exception e) {
            log.error("카카오 검색 결과 파싱 실패: {}", e.getMessage());
            return List.of();
        }
    }
}
