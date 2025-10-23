package com.coursemong.back.datecourse;

import com.coursemong.back.datecourse.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/date-courses")
public class DateCourseController {
    private final DateCourseService dateCourseService;

    @PostMapping
    public ResponseEntity<DateCourseResponse> createDateCourse(@RequestBody DateCourseRequest request) {
        DateCourseResponse dateCourseResponse = dateCourseService.createDateCourse(request);
        return ResponseEntity.ok(dateCourseResponse);
    }

    @PostMapping("/{dateCourseId}/activities")
    public ResponseEntity<List<ActivityResponse>> addActivity(@PathVariable Long dateCourseId, @RequestBody ActivityListRequest request) {
        List<ActivityResponse> ActivityResponses = dateCourseService.addActivity(dateCourseId, request);
        return ResponseEntity.ok(ActivityResponses);
    }

    @PostMapping("/{activityId}/foods")
    public ResponseEntity<List<RecommendationFoodResponse>> addRecommendationFood(@PathVariable Long activityId, @RequestBody RecommendationFoodListRequest request) {
        List<RecommendationFoodResponse> recommendationFoodResponses = dateCourseService.addRecommendationFood(activityId, request);
        return ResponseEntity.ok(recommendationFoodResponses);
    }
}
