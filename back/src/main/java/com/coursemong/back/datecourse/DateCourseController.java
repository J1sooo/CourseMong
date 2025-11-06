package com.coursemong.back.datecourse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.coursemong.back.datecourse.domain.ActivityType;
import com.coursemong.back.datecourse.dto.ActivityRequest;
import com.coursemong.back.datecourse.dto.DateCourseRequest;
import com.coursemong.back.datecourse.dto.DateCourseResponse;
import com.coursemong.back.datecourse.dto.DateCourseTempResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/date-courses")
public class DateCourseController {
    private final DateCourseService dateCourseService;
    private final DateCourseRedisService dateCourseRedisService;

    @PostMapping
    public ResponseEntity<DateCourseResponse> createDateCourse(@Valid @RequestBody DateCourseRequest request) {
        DateCourseResponse dateCourseResponse = dateCourseService.createDateCourse(request);
        return ResponseEntity.ok(dateCourseResponse);
    }

    @PostMapping("/temporary")
    public ResponseEntity<String> createTemporaryDateCourse(
            @Valid @RequestBody DateCourseRequest request) {
        String tempId = dateCourseRedisService.saveTemporary(request);
        return ResponseEntity.ok(tempId);
    }

    @GetMapping("/temporary/{tempId}")
    public ResponseEntity<DateCourseTempResponse> getTemporaryDateCourse(@PathVariable String tempId) {
        DateCourseTempResponse tempResponse = dateCourseRedisService.getTemporary(tempId);
        return ResponseEntity.ok(tempResponse);
    }

    @PatchMapping("/temporary/{tempId}/activities/{activityType}")
    public ResponseEntity<DateCourseTempResponse> updateActivity(
            @PathVariable String tempId,
            @PathVariable ActivityType activityType,
            @Valid @RequestBody ActivityRequest activityRequest) {

        DateCourseTempResponse tempResponse = dateCourseRedisService.updateActivityByType(tempId, activityType, activityRequest);
        return ResponseEntity.ok(tempResponse);
    }

    @PostMapping("/temporary/{tempId}/save")
    public ResponseEntity<DateCourseResponse> saveToDatabase(@PathVariable String tempId) {
        DateCourseResponse response = dateCourseService.saveToDatabase(tempId);
        return ResponseEntity.ok(response);
    }
}
