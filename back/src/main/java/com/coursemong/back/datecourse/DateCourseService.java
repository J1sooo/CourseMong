package com.coursemong.back.datecourse;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.coursemong.back.datecourse.domain.Activity;
import com.coursemong.back.datecourse.domain.DateCourse;
import com.coursemong.back.datecourse.domain.RecommendationFood;
import com.coursemong.back.datecourse.dto.DateCourseRequest;
import com.coursemong.back.datecourse.dto.DateCourseResponse;
import com.coursemong.back.datecourse.repository.DateCourseRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class DateCourseService {
    private final DateCourseRepository dateCourseRepository;

    @Transactional
    public DateCourseResponse createDateCourse(DateCourseRequest request) {
        DateCourse dateCourse = new DateCourse(request);

        request.getActivities().forEach(activityRequest -> {
            Activity activity = Activity.builder()
                    .activityType(activityRequest.getActivityType())
                    .activityName(activityRequest.getActivityName())
                    .activityContent(activityRequest.getActivityContent())
                    .location(activityRequest.getLocation())
                    .latitude(activityRequest.getLatitude())
                    .longitude(activityRequest.getLongitude())
                    .tellNumber(activityRequest.getTellNumber())
                    .runningTime(activityRequest.getRunningTime())
                    .dateCourse(dateCourse)
                    .build();

            activityRequest.getRecommendationFoods().forEach(foodRequest -> {
                RecommendationFood recommendationFood = new RecommendationFood(
                        foodRequest.getFoodName(),
                        foodRequest.getFoodPrice(),
                        activity
                );
                activity.getRecommendationFoods().add(recommendationFood);
            });
            dateCourse.getActivities().add(activity);
        });

        dateCourseRepository.save(dateCourse);
        return dateCourse.dateCourseToDto();
    }
}
