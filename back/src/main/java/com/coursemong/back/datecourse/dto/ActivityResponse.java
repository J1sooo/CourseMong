package com.coursemong.back.datecourse.dto;

import com.coursemong.back.datecourse.domain.Activity;
import com.coursemong.back.datecourse.domain.ActivityType;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ActivityResponse {
    private Long id;
    private ActivityType activityType;
    private String activityName;
    private String activityContent;
    private String location;
    private String lnmadr;
    private String rdnmdar;
    private String tellNumber;
    private String runningTime;
    private Double latitude;
    private Double longitude;
    private Long dateCourseId;
    private List<RecommendationFoodResponse> recommendationFoods;

    public ActivityResponse(Activity activity) {
        this.id = activity.getId();
        this.activityType = activity.getActivityType();
        this.activityName = activity.getActivityName();
        this.activityContent = activity.getActivityContent();
        this.location = activity.getLocation();
        this.lnmadr = activity.getLnmadr();
        this.rdnmdar = activity.getRdnmadr();
        this.tellNumber = activity.getTellNumber();
        this.runningTime = activity.getRunningTime();
        this.latitude = activity.getLatitude();
        this.longitude = activity.getLongitude();
        this.dateCourseId = activity.getDateCourse().getId();
        this.recommendationFoods = activity.getRecommendationFoods().stream()
                .map(RecommendationFoodResponse::new)
                .toList();
    }
}
