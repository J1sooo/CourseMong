package com.coursemong.back.dashboard;

import com.coursemong.back.dashboard.domain.ApiCallCount;
import com.coursemong.back.dashboard.domain.ApiType;
import com.coursemong.back.dashboard.dto.DailyApiCallCount;
import com.coursemong.back.dashboard.dto.DashboardResponse;
import com.coursemong.back.dashboard.repository.ApiCallCountRepository;
import com.coursemong.back.datecourse.DateCourseRedisService;
import com.coursemong.back.datecourse.dto.TempCourseSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Slf4j
@RequiredArgsConstructor
@Service
public class DashboardService {

    // 대시보드에서 보여줄 일별 집계 범위
    private static final int DAILY_STATS_RANGE_DAYS = 30;

    private final ApiCallCountRepository apiCallCountRepository;
    private final DateCourseRedisService dateCourseRedisService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        try {
            List<DailyApiCallCount> dailyApiCallCounts = getDailyApiCallCounts();
            long kakaoTotalCount = apiCallCountRepository.sumTotalCountByApiType(ApiType.KAKAO);
            long geminiTotalCount = apiCallCountRepository.sumTotalCountByApiType(ApiType.GEMINI);
            List<TempCourseSummary> temporaryCourses = dateCourseRedisService.getAllTemporarySummaries();

            return new DashboardResponse(dailyApiCallCounts, kakaoTotalCount, geminiTotalCount, temporaryCourses);
        } catch (Exception e) {
            log.error("대시보드 조회 실패: {}", e.getMessage());
            throw new RuntimeException("대시보드 조회 실패: " + e.getMessage(), e);
        }
    }

    private List<DailyApiCallCount> getDailyApiCallCounts() {
        LocalDate from = LocalDate.now().minusDays(DAILY_STATS_RANGE_DAYS - 1);
        List<ApiCallCount> counts = apiCallCountRepository.findAllByCallDateGreaterThanEqualOrderByCallDateDesc(from);

        // 날짜별로 카카오/제미나이 성공·실패 카운트를 합쳐서 하나의 행으로 묶음
        Map<LocalDate, long[]> dailyMap = new TreeMap<>(Comparator.reverseOrder());
        counts.forEach(count -> {
            long[] values = dailyMap.computeIfAbsent(count.getCallDate(), key -> new long[4]);
            if (count.getApiType() == ApiType.KAKAO) {
                values[0] += count.getSuccessCount();
                values[1] += count.getFailureCount();
            } else {
                values[2] += count.getSuccessCount();
                values[3] += count.getFailureCount();
            }
        });

        return dailyMap.entrySet().stream()
                .map(entry -> new DailyApiCallCount(
                        entry.getKey(),
                        entry.getValue()[0],
                        entry.getValue()[1],
                        entry.getValue()[2],
                        entry.getValue()[3]))
                .toList();
    }
}
