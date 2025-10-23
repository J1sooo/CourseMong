package com.coursemong.back.datecourse.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ActivityListRequest {
    private List<ActivityRequest> activities;
}
