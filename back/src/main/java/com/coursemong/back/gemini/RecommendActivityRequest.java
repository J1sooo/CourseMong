package com.coursemong.back.gemini;

import com.coursemong.back.datecourse.domain.ActivityType;
import com.coursemong.back.kakao.KakaoPlaceDto;

import java.util.List;

public record RecommendActivityRequest(
        ActivityType type,
        String category,
        List<KakaoPlaceDto> candidates
) {}
