package com.coursemong.back.dashboard.repository;

import com.coursemong.back.dashboard.domain.ApiCallCount;
import com.coursemong.back.dashboard.domain.ApiType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ApiCallCountRepository extends JpaRepository<ApiCallCount, Long> {

    List<ApiCallCount> findAllByCallDateGreaterThanEqualOrderByCallDateDesc(LocalDate from);

    // UPDATE ... SET count = count + 1 형태의 원자적 증가
    // save()로 읽고-더하고-쓰는 방식은 동시 요청 시 카운트가 유실될 수 있어 지양
    @Modifying
    @Query("UPDATE ApiCallCount a SET a.successCount = a.successCount + 1 "
            + "WHERE a.apiType = :apiType AND a.callDate = :callDate")
    int increaseSuccessCount(@Param("apiType") ApiType apiType, @Param("callDate") LocalDate callDate);

    @Modifying
    @Query("UPDATE ApiCallCount a SET a.failureCount = a.failureCount + 1 "
            + "WHERE a.apiType = :apiType AND a.callDate = :callDate")
    int increaseFailureCount(@Param("apiType") ApiType apiType, @Param("callDate") LocalDate callDate);

    @Query("SELECT COALESCE(SUM(a.successCount + a.failureCount), 0) FROM ApiCallCount a WHERE a.apiType = :apiType")
    long sumTotalCountByApiType(@Param("apiType") ApiType apiType);
}
