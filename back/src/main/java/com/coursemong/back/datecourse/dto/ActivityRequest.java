package com.coursemong.back.datecourse.dto;

import jakarta.validation.constraints.NotNull;
import com.coursemong.back.datecourse.domain.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ActivityRequest {
    @NotNull
    private ActivityType activityType;

    @NotNull
    private String locationName;

    @NotNull
    private String locationContent;

    @NotNull
    private String locationUrl;

    private String address;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;
}
