package com.coursemong.back.datecourse.dto;

import com.coursemong.back.datecourse.domain.Activity;
import com.coursemong.back.datecourse.domain.ActivityType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ActivityResponse {
    private Long id;
    private ActivityType activityType;
    private String locationName;
    private String locationContent;
    private String locationUrl;
    private String address;
    private Double latitude;
    private Double longitude;
    private Long dateCourseId;

    public ActivityResponse(Activity activity) {
        this.id = activity.getId();
        this.activityType = activity.getActivityType();
        this.locationName = activity.getLocationName();
        this.locationContent = activity.getLocationContent();
        this.locationUrl = activity.getLocationUrl();
        this.address = activity.getAddress();
        this.latitude = activity.getLatitude();
        this.longitude = activity.getLongitude();
        this.dateCourseId = activity.getDateCourse().getId();
    }
}
