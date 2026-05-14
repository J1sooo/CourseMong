package com.coursemong.back.datecourse;

import com.coursemong.back.datecourse.repository.DateCourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DateCourseScheduler {

    private static final int TTL_MONTHS = 3;

    private final DateCourseRepository dateCourseRepository;

    // 매일 자정 실행
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void deleteExpiredDateCourses() {
        LocalDateTime threshold = LocalDateTime.now().minusMonths(TTL_MONTHS);

        List<com.coursemong.back.datecourse.domain.DateCourse> expiredCourses =
                dateCourseRepository.findAllByPublishedFalseAndLastViewedAtBefore(threshold);

        if (expiredCourses.isEmpty()) {
            log.debug("만료된 코스 없음");
            return;
        }

        dateCourseRepository.deleteAll(expiredCourses);
        log.info("만료된 코스 {}개 삭제 완료", expiredCourses.size());
    }
}
