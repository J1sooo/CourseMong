package com.coursemong.back.gemini;

import com.coursemong.back.datecourse.DateCourseRedisService;
import com.coursemong.back.datecourse.domain.ActivityType;
import com.coursemong.back.datecourse.dto.ActivityRequest;
import com.coursemong.back.datecourse.dto.ActivityTempResponse;
import com.coursemong.back.datecourse.dto.DateCourseTempResponse;
import com.coursemong.back.kakao.KakaoPlaceDto;
import com.coursemong.back.kakao.KakaoSearchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GoogleSearch;
import com.google.genai.types.Part;
import com.google.genai.types.Tool;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
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
                    List<KakaoPlaceDto> candidates = kakaoSearchService.searchPlaces(query, 1, 7);
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

        // Redis에서 현재 코스 전체 상태 조회 (다른 activity 정보 + 제외 이력 확보용)
        DateCourseTempResponse currentCourse = redisService.getTemporary(tempId);

        ActivityTempResponse targetActivity = currentCourse.getActivities().stream()
                .filter(activity -> activity.getActivityType() == request.activityType())
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException(request.activityType() + " 타입의 activity를 찾을 수 없음"));

        // 같은 코스 내 다른 activity (중복 선택 방지, 거리 비교용)
        List<OtherActivityInfo> otherActivities = currentCourse.getActivities().stream()
                .filter(activity -> activity.getActivityType() != request.activityType())
                .map(activity -> new OtherActivityInfo(
                        activity.getActivityType(), activity.getLocationName(), activity.getLatitude(), activity.getLongitude()))
                .toList();
        log.debug("다른 activity 정보: {}", otherActivities);

        // 기존 제외 이력 + 현재 장소를 누적해서 다음 재추천에도 다시 안 나오게 함
        List<String> excludedLocationNames = new ArrayList<>(
                targetActivity.getExcludedLocationNames() != null ? targetActivity.getExcludedLocationNames() : List.of());
        if (targetActivity.getLocationName() != null) {
            excludedLocationNames.add(targetActivity.getLocationName());
        }
        log.debug("누적 제외 목록: {}", excludedLocationNames);

        String query = currentCourse.getArea() + " " + request.category();
        List<KakaoPlaceDto> candidates = kakaoSearchService.searchPlaces(query, 1, 15);
        log.debug("카카오 재검색 - 쿼리: {}, 결과: {}개", query, candidates.size());

        // candidates 필터링은 excludedLocationNames(이력) + otherActivities(현재 다른 activity)를 모두 적용
        List<String> namesToFilter = new ArrayList<>(excludedLocationNames);
        otherActivities.forEach(other -> namesToFilter.add(other.locationName()));

        List<KakaoPlaceDto> filteredCandidates = candidates.stream()
                .filter(place -> !namesToFilter.contains(place.placeName()))
                .toList();

        // 제외 후 결과가 없으면 전체 사용
        List<KakaoPlaceDto> finalCandidates = filteredCandidates.isEmpty() ? candidates : filteredCandidates;
        log.debug("최종 candidates: {}개 (제외 전: {}개)", finalCandidates.size(), candidates.size());

        String promptJson = buildUpdatePromptJson(currentCourse.getArea(), request, targetActivity.getLocationName(), otherActivities, excludedLocationNames, finalCandidates);
        log.debug("제미나이 수정 프롬프트 JSON: {}", promptJson);

        String rawResponse = geminiApiClient.callGemini(promptJson, config);
        log.debug("제미나이 수정 응답: {}", rawResponse);

        return parseAndUpdate(tempId, request.activityType(), rawResponse, excludedLocationNames);
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
        Tool searchTool = Tool.builder()
                .googleSearch(GoogleSearch.builder().build())
                .build();
        return GenerateContentConfig.builder()
                .systemInstruction(systemContent)
                .tools(List.of(searchTool))
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

    private String buildUpdatePromptJson(
            String area,
            UpdateActivityRequest request,
            String currentLocationName,
            List<OtherActivityInfo> otherActivities,
            List<String> excludedLocationNames,
            List<KakaoPlaceDto> candidates) {
        try {
            Map<String, Object> prompt = new HashMap<>();
            prompt.put("area", area);
            prompt.put("relationship", request.relationship());
            prompt.put("hobby", request.hobby());
            prompt.put("theme", request.theme());
            prompt.put("activityType", request.activityType());
            prompt.put("category", request.category());
            prompt.put("currentLocationName", currentLocationName);
            prompt.put("otherActivities", otherActivities);
            prompt.put("excludedLocationNames", excludedLocationNames);
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

    private String extractJson(String rawResponse) {
        rawResponse = rawResponse.trim();
        if (rawResponse.startsWith("```")) {
            rawResponse = rawResponse.replaceAll("^```json\\s*", "").replaceAll("\\s*```$", "").trim();
        }
        int start = rawResponse.indexOf('{');
        int end = rawResponse.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            return rawResponse.substring(start, end + 1);
        }
        return rawResponse;
    }

    private DateCourseTempResponse parseAndSave(String rawResponse) {
        try {
            DateCourseTempResponse aiResponse = objectMapper.readValue(extractJson(rawResponse), DateCourseTempResponse.class);
            String tempId = redisService.saveTemporary(aiResponse.toRequest());
            return redisService.getTemporary(tempId);
        } catch (Exception e) {
            log.error("응답 파싱 및 저장 실패: {}", e.getMessage());
            throw new RuntimeException("응답 파싱 및 저장 실패: " + e.getMessage(), e);
        }
    }

    private DateCourseTempResponse parseAndUpdate(
            String tempId, ActivityType activityType, String rawResponse, List<String> excludedLocationNames) {
        try {
            ActivityRequest newActivity = objectMapper.readValue(extractJson(rawResponse), ActivityRequest.class);
            return redisService.updateActivityByType(tempId, activityType, newActivity, excludedLocationNames);
        } catch (Exception e) {
            log.error("수정 응답 파싱 및 업데이트 실패: {}", e.getMessage());
            throw new RuntimeException("수정 응답 파싱 및 업데이트 실패: " + e.getMessage(), e);
        }
    }
}
