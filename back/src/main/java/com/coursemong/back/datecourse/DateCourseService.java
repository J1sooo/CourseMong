package com.coursemong.back.datecourse;

import com.coursemong.back.datecourse.domain.Activity;
import com.coursemong.back.datecourse.domain.DateCourse;
import com.coursemong.back.datecourse.domain.RecommendationFood;
import com.coursemong.back.datecourse.dto.*;
import com.coursemong.back.datecourse.repository.ActivityRepository;
import com.coursemong.back.datecourse.repository.DateCourseRepository;
import com.coursemong.back.datecourse.repository.RecommendationFoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class DateCourseService {
    private final DateCourseRepository dateCourseRepository;
    private final ActivityRepository activityRepository;
    private final RecommendationFoodRepository recommendationFoodRepository;

    @Transactional
    public DateCourseResponse createDateCourse(DateCourseRequest request) {
        DateCourse dateCourse = new DateCourse(request);
        dateCourseRepository.save(dateCourse);
        return dateCourse.dateCourseToDto();
    }

    @Transactional
    public ActivityResponse addActivity(Long dateCourseId, ActivityRequest request) {
        DateCourse dateCourse = dateCourseRepository.findById(dateCourseId)
                .orElseThrow(() -> new IllegalArgumentException("not fount dateCourse"));
        Activity activity = Activity.builder()
                .activityType(request.getActivityType())
                .activityName(request.getActivityName())
                .activityContent(request.getActivityContent())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .tellNumber(request.getTellNumber())
                .runningTime(request.getRunningTime())
                .dateCourse(dateCourse)
                .build();

        activityRepository.save(activity);
        return activity.activityToDto();
    }

    @Transactional
    public RecommendationFoodResponse addRecommendationFood(Long activityId, RecommendationFoodRequest request) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new IllegalArgumentException("not fount activity"));

        RecommendationFood food = new RecommendationFood(
                request.getFoodName(),
                request.getFoodPrice(),
                activity
        );
        recommendationFoodRepository.save(food);
        return food.recommendationFoodToDto();
    }
}
