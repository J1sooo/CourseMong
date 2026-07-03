package com.coursemong.back.dashboard.dto;

import com.coursemong.back.datecourse.dto.TempCourseSummary;

import java.util.List;

public record DashboardResponse(
        List<DailyApiCallCount> dailyApiCallCounts,
        long kakaoTotalCount,
        long geminiTotalCount,
        List<TempCourseSummary> temporaryCourses
) {
}
