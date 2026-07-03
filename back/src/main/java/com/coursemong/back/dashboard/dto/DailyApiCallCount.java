package com.coursemong.back.dashboard.dto;

import java.time.LocalDate;

public record DailyApiCallCount(
        LocalDate date,
        long kakaoSuccessCount,
        long kakaoFailureCount,
        long geminiSuccessCount,
        long geminiFailureCount
) {
}
