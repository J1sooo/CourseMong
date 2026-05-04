package com.coursemong.back.datecourse;

import com.coursemong.back.datecourse.dto.DateCourseTempResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.coursemong.back.datecourse.domain.Activity;
import com.coursemong.back.datecourse.domain.DateCourse;
import com.coursemong.back.datecourse.dto.DateCourseRequest;
import com.coursemong.back.datecourse.dto.DateCourseResponse;
import com.coursemong.back.datecourse.repository.DateCourseRepository;

import java.util.UUID;

import lombok.RequiredArgsConstructor;


@Slf4j
@RequiredArgsConstructor
@Service
public class DateCourseService {
    private final DateCourseRepository dateCourseRepository;
    private final DateCourseRedisService redisService;

    @Transactional
    public DateCourseResponse saveToDatabase(String tempId) {
        DateCourseTempResponse tempResponse = redisService.getTemporary(tempId);

        DateCourseRequest request = tempResponse.toRequest();

        DateCourseResponse response = createDateCourse(request);

        redisService.deleteTemporary(tempId);

        log.info("저장 완료 DB ID: {}", response.getId());

        return response;
    }

    @Transactional
    public DateCourseResponse createDateCourse(DateCourseRequest request) {
        DateCourse dateCourse = new DateCourse(request);

        request.getActivities().forEach(activityRequest -> {
            Activity activity = Activity.builder()
                    .activityType(activityRequest.getActivityType())
                    .locationName(activityRequest.getLocationName())
                    .locationContent(activityRequest.getLocationContent())
                    .locationUrl(activityRequest.getLocationUrl())
                    .address(activityRequest.getAddress())
                    .latitude(activityRequest.getLatitude())
                    .longitude(activityRequest.getLongitude())
                    .dateCourse(dateCourse)
                    .build();
            dateCourse.getActivities().add(activity);
        });

        dateCourseRepository.save(dateCourse);
        return dateCourse.dateCourseToDto();
    }

    @Transactional
    public DateCourseResponse getDateCourseByUuid(UUID courseUuid) {
        DateCourse dateCourse = dateCourseRepository.findByCourseUuid(courseUuid)
                .orElseThrow(() -> new EntityNotFoundException("데이트 코스를 찾을 수 없음"));
        return dateCourse.dateCourseToDto();
    }

    @Transactional
    public DateCourseResponse getDateCourse(Long courseId) {
        DateCourse dateCourse = dateCourseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("데이트 코스를 찾을 수 없음"));

        return dateCourse.dateCourseToDto();
    }

    @Transactional
    public void deleteDateCourse(Long courseId) {
        DateCourse dateCourse = dateCourseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("데이트 코스를 찾을 수 없음"));
        dateCourseRepository.delete(dateCourse);
    }
}
