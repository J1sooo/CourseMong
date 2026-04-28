package com.coursemong.back.gemini;

import com.coursemong.back.datecourse.DateCourseRedisService;
import com.coursemong.back.datecourse.dto.DateCourseTempResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiService {
    private final Client client;
    private final ObjectMapper objectMapper;
    private final DateCourseRedisService redisService;

    @Transactional
    public DateCourseTempResponse generateText(GeminiRequest request) {
        // 시스템 지시어 정의
        String systemInstruction = """
                너는 한국 데이트 코스 검색 전문가야.
                모든 장소 정보는 반드시 '구글 지도(Google Maps)'에서 실제로 검색 가능하고 운영중인 곳을 기준으로 검색해.
                [규칙]
                1. 장소 이름은 구글 지도에 등록된 명칭을 사용해.
                2. 주소는 구글 지도에서 검색되는 주소로 해.
                3. 마크다운 기호(```json)를 절대 사용하지 마.
                4. 오직 JSON 객체 데이터만 반환해.
                5. locationUrl은 google Maps에서 검색된 URL을 보여줘. 
               
    
                  [JSON 출력 스키마]
                  {
                    "title": "데이트 코스 제목",
                    "area": "지역명",
                    "activities": [
                      {
                        "activityType": "MORNING | LUNCH | AFTERNOON | DINNER",
                        "locationName": "장소 이름",
                        "locationContent": "장소에 대한 1줄 설명",
                        "locationUrl": "구글 URL",
                        "address": "구글에 등록된 주소",
                        "latitude": 0.0,
                        "longitude": 0.0
                      }
                    ]
                  }
                """;

        // 설정 객체 생성 및 시스템 지시어 삽입
        Part systemPart = Part.fromText(systemInstruction);

        Content systemContent = Content.builder()
                .role("system")
                .parts(List.of(systemPart))
                .build();

        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(systemContent)
                .build();

        try {
            // DTO -> JSON 문자열로 변환
            String prompt = objectMapper.writeValueAsString(request);

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-2.5-flash",
                            prompt,
                            config
                    );
            // AI의 응답을 안전하게 JSON으로 파싱하기 위한 필터링 로직
            String rawResponse = response.text();

            // 1. 앞뒤 공백 제거
            rawResponse = rawResponse.trim();

            // 2. 만약 AI가 마크다운 코드 블록(```json ... ```)으로 감쌌다면 이를 제거
            if (rawResponse.startsWith("```")) {
                rawResponse = rawResponse.replaceAll("^```json", "").replaceAll("```$", "").trim();
            }

            DateCourseTempResponse aiResponse = objectMapper.readValue(rawResponse, DateCourseTempResponse.class);
            System.out.println(aiResponse);
            String tempId = redisService.saveTemporary(aiResponse.toRequest());
            return redisService.getTemporary(tempId);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
