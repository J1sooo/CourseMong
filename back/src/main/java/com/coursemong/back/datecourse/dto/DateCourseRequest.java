package com.coursemong.back.datecourse.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DateCourseRequest {
    @NotNull
    private String title;

    @NotNull
    private String area;

    private boolean published;

    @Valid
    @NotNull
    @NotEmpty
    private List<ActivityRequest> activities;
}
