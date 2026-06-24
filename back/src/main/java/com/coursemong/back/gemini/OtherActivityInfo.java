package com.coursemong.back.gemini;

import com.coursemong.back.datecourse.domain.ActivityType;

// 재추천 시 같은 코스 내 다른 activity 정보 전달용 (중복 선택 방지, 거리 비교용)
public record OtherActivityInfo(
        ActivityType activityType,
        String locationName,
        Double latitude,
        Double longitude
) {}
