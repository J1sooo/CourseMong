package com.coursemong.back.datecourse.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DateCourseRequest {
    @NotNull
    private String title;

    @NotNull
    private String area;
}
