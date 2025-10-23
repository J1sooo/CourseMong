package com.coursemong.back.datecourse;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.coursemong.back.datecourse.domain.Activity;
import com.coursemong.back.datecourse.domain.DateCourse;
import com.coursemong.back.datecourse.domain.RecommendationFood;
import com.coursemong.back.datecourse.dto.ActivityListRequest;
import com.coursemong.back.datecourse.dto.ActivityResponse;
import com.coursemong.back.datecourse.dto.DateCourseRequest;
import com.coursemong.back.datecourse.dto.DateCourseResponse;
import com.coursemong.back.datecourse.dto.RecommendationFoodListRequest;
import com.coursemong.back.datecourse.dto.RecommendationFoodResponse;
import com.coursemong.back.datecourse.repository.ActivityRepository;
import com.coursemong.back.datecourse.repository.DateCourseRepository;
import com.coursemong.back.datecourse.repository.RecommendationFoodRepository;

import lombok.RequiredArgsConstructor;

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
    public List<ActivityResponse> addActivity(Long dateCourseId, ActivityListRequest request) {
        DateCourse dateCourse = dateCourseRepository.findById(dateCourseId)
                .orElseThrow(() -> new IllegalArgumentException("not fount dateCourse"));

        List<Activity> activities = request.getActivities().stream()
                .map(activityRequest -> Activity.builder()
                .activityType(activityRequest.getActivityType())
                .activityName(activityRequest.getActivityName())
                .activityContent(activityRequest.getActivityContent())
                .location(activityRequest.getLocation())
                .latitude(activityRequest.getLatitude())
                .longitude(activityRequest.getLongitude())
                .tellNumber(activityRequest.getTellNumber())
                .runningTime(activityRequest.getRunningTime())
                .dateCourse(dateCourse)
                .build()).toList();

        activityRepository.saveAll(activities);
        return activities.stream()
                .map(Activity::activityToDto)
                .toList();
    }

    @Transactional
    public List<RecommendationFoodResponse> addRecommendationFood(Long activityId, RecommendationFoodListRequest request) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new IllegalArgumentException("not fount activity"));

        List<RecommendationFood> foods = request.getRecommendationFoods().stream()
                .map(foodRequest -> new RecommendationFood(
                        foodRequest.getFoodName(),
                        foodRequest.getFoodPrice(),
                        activity
                )).toList();

        recommendationFoodRepository.saveAll(foods);
        return foods.stream()
                .map(RecommendationFood::recommendationFoodToDto)
                .toList();
    }
}
