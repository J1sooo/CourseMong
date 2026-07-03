package com.coursemong.back.dashboard.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// 카카오/제미나이 API 호출 수를 일자별로 집계하는 엔티티
// (api_type, call_date) 조합으로 하루에 한 row만 존재
@Entity
@Table(
        name = "api_call_count",
        uniqueConstraints = @UniqueConstraint(name = "uk_api_type_call_date", columnNames = {"api_type", "call_date"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ApiCallCount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "api_type", nullable = false, length = 20)
    private ApiType apiType;

    @Column(name = "call_date", nullable = false)
    private LocalDate callDate;

    @Column(name = "success_count", nullable = false)
    private long successCount;

    @Column(name = "failure_count", nullable = false)
    private long failureCount;

    @Builder
    private ApiCallCount(ApiType apiType, LocalDate callDate) {
        this.apiType = apiType;
        this.callDate = callDate;
        this.successCount = 0;
        this.failureCount = 0;
    }

    public static ApiCallCount init(ApiType apiType, LocalDate callDate) {
        return ApiCallCount.builder()
                .apiType(apiType)
                .callDate(callDate)
                .build();
    }
}
