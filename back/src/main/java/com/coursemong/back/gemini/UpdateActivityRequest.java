package com.coursemong.back.gemini;

import com.coursemong.back.datecourse.domain.ActivityType;
import com.coursemong.back.datecourse.domain.UpdateReason;

import java.util.List;

public record UpdateActivityRequest(
        String area,
        String relationship,
        List<String> hobby,
        String theme,
        ActivityType activityType,
        String category,
        String excludeLocationName,  // 기존에 선택된 장소 (제외 대상)
        UpdateReason updateReason    // 수정 이유
) {}
