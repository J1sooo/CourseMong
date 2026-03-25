package com.coursemong.back.datecourse.dto;

import com.coursemong.back.datecourse.domain.DateCourse;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
public class DateCourseResponse {
    private Long id;
    private String title;
    private String area;
    private UUID courseUuid;
    private LocalDateTime createdAt;
    private LocalDateTime lastViewedAt;
    private List<ActivityResponse> activities;

    public DateCourseResponse(DateCourse dateCourse) {
        this.id = dateCourse.getId();
        this.title = dateCourse.getTitle();
        this.area = dateCourse.getArea();
        this.courseUuid = dateCourse.getCourseUuid();
        this.createdAt = dateCourse.getCreatedAt();
        this.lastViewedAt = dateCourse.getLastViewedAt();
        this.activities = dateCourse.getActivities().stream()
                .map(ActivityResponse::new)
                .toList();
    }
}
