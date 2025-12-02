package com.coursemong.back.datecourse.dto;

import com.coursemong.back.datecourse.domain.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityTempResponse {
    private ActivityType activityType;
    private String activityName;
    private String activityContent;
    private String location;
    private String lnmadr;
    private String rdnmadr;
    private Double latitude;
    private Double longitude;
    private String tellNumber;
    private String runningTime;
    private List<RecommendationFoodRequest> recommendationFoods;

    public static ActivityTempResponse fromRequest(ActivityRequest request) {
        return ActivityTempResponse.builder()
                .activityType(request.getActivityType())
                .activityName(request.getActivityName())
                .activityContent(request.getActivityContent())
                .location(request.getLocation())
                .lnmadr(request.getLnmadr())
                .rdnmadr(request.getRdnmadr())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .tellNumber(request.getTellNumber())
                .runningTime(request.getRunningTime())
                .recommendationFoods(request.getRecommendationFoods())
                .build();
    }

    public ActivityRequest toRequest() {
        return new ActivityRequest(
                this.activityType,
                this.activityName,
                this.activityContent,
                this.location,
                this.lnmadr,
                this.rdnmadr,
                this.latitude,
                this.longitude,
                this.tellNumber,
                this.runningTime,
                this.recommendationFoods
        );
    }
}
