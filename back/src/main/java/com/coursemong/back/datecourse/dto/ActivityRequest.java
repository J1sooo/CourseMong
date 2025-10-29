package com.coursemong.back.datecourse.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import com.coursemong.back.datecourse.domain.ActivityType;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ActivityRequest {
    @NotNull
    private ActivityType activityType;

    @NotNull
    private String activityName;

    @NotNull
    private String activityContent;

    @NotNull
    private String location;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private String tellNumber;

    private String runningTime;

    @Valid
    private List<RecommendationFoodRequest> recommendationFoods;
}
