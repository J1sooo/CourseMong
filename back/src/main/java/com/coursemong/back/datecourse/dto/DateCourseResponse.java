package com.coursemong.back.datecourse.dto;

import com.coursemong.back.datecourse.domain.DateCourse;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DateCourseResponse {
    private Long id;
    private String title;
    private String area;

    public DateCourseResponse(DateCourse dateCourse) {
        this.id = dateCourse.getId();
        this.title = dateCourse.getTitle();
        this.area = dateCourse.getArea();
    }
}
