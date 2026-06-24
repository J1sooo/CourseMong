package com.coursemong.back.gemini;

import com.coursemong.back.datecourse.domain.ActivityType;
import com.coursemong.back.datecourse.domain.UpdateReason;

import java.util.List;

public record UpdateActivityRequest(
        String relationship,
        List<String> hobby,
        String theme,
        String date,
        ActivityType activityType,
        String category,
        UpdateReason updateReason    // 수정 이유 (재시도 시 null)
) {}
