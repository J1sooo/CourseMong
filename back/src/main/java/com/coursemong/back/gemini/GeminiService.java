package com.coursemong.back.gemini;

import com.coursemong.back.datecourse.DateCourseRedisService;
import com.coursemong.back.datecourse.dto.ActivityRequest;
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
import java.util.HashMap;
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
        String systemInstruction = loadSystemInstruction("prompts/gemini-system.txt");
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

    public DateCourseTempResponse updateActivity(String tempId, UpdateActivityRequest request) {
        String systemInstruction = loadSystemInstruction("prompts/gemini-update-system.txt");
        GenerateContentConfig config = buildConfig(systemInstruction);

        // 수정 시 10개로 더 많은 선택지 제공
        String query = request.area() + " " + request.category();
        List<KakaoPlaceDto> candidates = kakaoSearchService.searchPlaces(query, 1, 10);
        log.debug("카카오 재검색 - 쿼리: {}, 결과: {}개", query, candidates.size());

        // 기존 선택 장소 제외 시도
        List<KakaoPlaceDto> filteredCandidates = candidates.stream()
                .filter(place -> !place.placeName().equals(request.excludeLocationName()))
                .toList();

        // 제외 후 결과가 없으면 전체 사용
        List<KakaoPlaceDto> finalCandidates = filteredCandidates.isEmpty() ? candidates : filteredCandidates;
        log.debug("최종 candidates: {}개 (제외 전: {}개)", finalCandidates.size(), candidates.size());

        String promptJson = buildUpdatePromptJson(request, finalCandidates);
        log.debug("제미나이 수정 프롬프트 JSON: {}", promptJson);

        String rawResponse = geminiApiClient.callGemini(promptJson, config);
        log.debug("제미나이 수정 응답: {}", rawResponse);

        return parseAndUpdate(tempId, request.activityType(), rawResponse);
    }

    private String loadSystemInstruction(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
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

    private String buildUpdatePromptJson(UpdateActivityRequest request, List<KakaoPlaceDto> candidates) {
        try {
            Map<String, Object> prompt = new HashMap<>();
            prompt.put("area", request.area());
            prompt.put("relationship", request.relationship());
            prompt.put("hobby", request.hobby());
            prompt.put("theme", request.theme());
            prompt.put("activityType", request.activityType());
            prompt.put("category", request.category());
            prompt.put("excludeLocationName", request.excludeLocationName());
            prompt.put("candidates", candidates);
            if (request.updateReason() != null) {
                prompt.put("updateReason", request.updateReason());
            }
            return objectMapper.writeValueAsString(prompt);
        } catch (Exception e) {
            log.error("수정 프롬프트 JSON 직렬화 실패: {}", e.getMessage());
            throw new RuntimeException("수정 프롬프트 JSON 직렬화 실패: " + e.getMessage(), e);
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

    private DateCourseTempResponse parseAndUpdate(String tempId, com.coursemong.back.datecourse.domain.ActivityType activityType, String rawResponse) {
        try {
            if (rawResponse.startsWith("```")) {
                rawResponse = rawResponse.replaceAll("^```json", "").replaceAll("```$", "").trim();
            }
            ActivityRequest newActivity = objectMapper.readValue(rawResponse, ActivityRequest.class);
            return redisService.updateActivityByType(tempId, activityType, newActivity);
        } catch (Exception e) {
            log.error("수정 응답 파싱 및 업데이트 실패: {}", e.getMessage());
            throw new RuntimeException("수정 응답 파싱 및 업데이트 실패: " + e.getMessage(), e);
        }
    }
}
