package com.coursemong.back.dashboard;

import com.coursemong.back.dashboard.domain.ApiCallCount;
import com.coursemong.back.dashboard.domain.ApiType;
import com.coursemong.back.dashboard.repository.ApiCallCountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@RequiredArgsConstructor
@Service
public class ApiCallCountService {

    private final ApiCallCountRepository apiCallCountRepository;

    // KakaoApiClient / GeminiApiClient에서 실제 호출을 시도할 때마다 호출
    // @Retryable로 재시도되는 시도들도 실제 API 쿼터를 소모하므로 재시도 각각을 카운트에 포함
    @Transactional
    public void recordSuccess(ApiType apiType) {
        recordCall(apiType, true);
    }

    @Transactional
    public void recordFailure(ApiType apiType) {
        recordCall(apiType, false);
    }

    private void recordCall(ApiType apiType, boolean success) {
        try {
            LocalDate today = LocalDate.now();

            if (increase(apiType, today, success) > 0) {
                return;
            }

            // 오늘자 row가 아직 없는 경우 -> 생성 후 다시 증가
            createTodayRowIfAbsent(apiType, today);
            increase(apiType, today, success);
        } catch (Exception e) {
            // 카운트 기록은 부가 기능이라 여기서 실패해도 API 호출 자체(Kakao/Gemini 응답)를 막으면 안 됨
            // 그래서 RuntimeException으로 전파하지 않고 로그만 남기고 흡수함
            log.warn("API 호출 카운트 기록 실패 apiType: {}, success: {}, message: {}", apiType, success, e.getMessage());
        }
    }

    private void createTodayRowIfAbsent(ApiType apiType, LocalDate today) {
        try {
            apiCallCountRepository.saveAndFlush(ApiCallCount.init(apiType, today));
        } catch (DataIntegrityViolationException e) {
            log.debug("동시 요청으로 오늘자 카운트 row가 이미 생성됨 apiType: {}", apiType);
        }
    }

    private int increase(ApiType apiType, LocalDate date, boolean success) {
        return success
                ? apiCallCountRepository.increaseSuccessCount(apiType, date)
                : apiCallCountRepository.increaseFailureCount(apiType, date);
    }
}
