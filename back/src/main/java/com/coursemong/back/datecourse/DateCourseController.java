package com.coursemong.back.datecourse;

import com.coursemong.back.datecourse.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/date-courses")
public class DateCourseController {
    private final DateCourseService dateCourseService;

    @PostMapping
    public ResponseEntity<DateCourseResponse> createDateCourse(@Valid @RequestBody DateCourseRequest request) {
        DateCourseResponse dateCourseResponse = dateCourseService.createDateCourse(request);
        return ResponseEntity.ok(dateCourseResponse);
    }
}
