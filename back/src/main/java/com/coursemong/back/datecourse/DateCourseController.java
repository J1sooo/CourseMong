package com.coursemong.back.datecourse;

import com.coursemong.back.datecourse.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ActivityResponse> addActivity(@PathVariable Long dateCourseId, @RequestBody ActivityRequest request) {
        ActivityResponse ActivityResponse = dateCourseService.addActivity(dateCourseId, request);
        return ResponseEntity.ok(ActivityResponse);
    }

    @PostMapping("/{activityId}/foods")
    public ResponseEntity<RecommendationFoodResponse> addRecommendationFood(@PathVariable Long activityId, @RequestBody RecommendationFoodRequest request) {
        RecommendationFoodResponse recommendationFoodResponse = dateCourseService.addRecommendationFood(activityId, request);
        return ResponseEntity.ok(recommendationFoodResponse);
    }
}
