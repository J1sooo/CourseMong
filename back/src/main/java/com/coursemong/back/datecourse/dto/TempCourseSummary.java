package com.coursemong.back.datecourse.dto;

// 대시보드용 — Redis에 저장된 임시 코스 1건의 요약 정보
public record TempCourseSummary(
        String tempId,
        String title,
        String area,
        long remainingTtlSeconds
) {
}
