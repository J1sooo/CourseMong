package com.coursemong.back.gemini;

import com.coursemong.back.datecourse.DateCourseRedisService;
import com.coursemong.back.datecourse.dto.DateCourseTempResponse;
import com.coursemong.back.kakao.KakaoPlaceDto;
import com.coursemong.back.kakao.KakaoSearchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.Part;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiService {

    private final GeminiApiClient geminiApiClient;
    private final ObjectMapper objectMapper;
    private final DateCourseRedisService redisService;
    private final KakaoSearchService kakaoSearchService;

    @Transactional
    public DateCourseTempResponse generateText(GeminiRequest request) {
        String systemInstruction = loadSystemInstruction();
        GenerateContentConfig config = buildConfig(systemInstruction);

        List<RecommendActivityRequest> activitiesWithCandidates = request.activities().stream()
                .map(activity -> {
                    String query = request.area() + " " + activity.category();
                    List<KakaoPlaceDto> candidates = kakaoSearchService.searchPlaces(query, 1, 5);
                    log.debug("카카오 검색 - 쿼리: {}, 결과: {}개", query, candidates.size());
                    return new RecommendActivityRequest(activity.type(), activity.category(), candidates);
                })
                .toList();

        String promptJson = buildPromptJson(request, activitiesWithCandidates);
        log.debug("제미나이 프롬프트 JSON: {}", promptJson);

        String rawResponse = geminiApiClient.callGemini(promptJson, config);
        log.debug("제미나이 응답: {}", rawResponse);

        return parseAndSave(rawResponse);
    }

    private String loadSystemInstruction() {
        try {
            ClassPathResource resource = new ClassPathResource("prompts/gemini-system.txt");
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("프롬프트 파일 읽기 실패: {}", e.getMessage());
            throw new RuntimeException("프롬프트 파일 읽기 실패: " + e.getMessage(), e);
        }
    }

    private GenerateContentConfig buildConfig(String systemInstruction) {
        Part systemPart = Part.fromText(systemInstruction);
        Content systemContent = Content.builder()
                .role("system")
                .parts(List.of(systemPart))
                .build();
        return GenerateContentConfig.builder()
                .systemInstruction(systemContent)
                .build();
    }

    private String buildPromptJson(GeminiRequest request, List<RecommendActivityRequest> activities) {
        try {
            Map<String, Object> prompt = Map.of(
                    "area", request.area(),
                    "relationship", request.relationship(),
                    "date", request.date() != null ? request.date().toString() : "",
                    "hobby", request.hobby(),
                    "theme", request.theme(),
                    "activities", activities
            );
            return objectMapper.writeValueAsString(prompt);
        } catch (Exception e) {
            log.error("프롬프트 JSON 직렬화 실패: {}", e.getMessage());
            throw new RuntimeException("프롬프트 JSON 직렬화 실패: " + e.getMessage(), e);
        }
    }

    private DateCourseTempResponse parseAndSave(String rawResponse) {
        try {
            if (rawResponse.startsWith("```")) {
                rawResponse = rawResponse.replaceAll("^```json", "").replaceAll("```$", "").trim();
            }
            DateCourseTempResponse aiResponse = objectMapper.readValue(rawResponse, DateCourseTempResponse.class);
            String tempId = redisService.saveTemporary(aiResponse.toRequest());
            return redisService.getTemporary(tempId);
        } catch (Exception e) {
            log.error("응답 파싱 및 저장 실패: {}", e.getMessage());
            throw new RuntimeException("응답 파싱 및 저장 실패: " + e.getMessage(), e);
        }
    }
}
