package com.coursemong.back.datecourse.dto;

import com.coursemong.back.datecourse.domain.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityTempResponse {
    private ActivityType activityType;
    private String locationName;
    private String locationContent;
    private String locationUrl;
    private String address;
    private Double latitude;
    private Double longitude;

    public static ActivityTempResponse fromRequest(ActivityRequest request) {
        return ActivityTempResponse.builder()
                .activityType(request.getActivityType())
                .locationName(request.getLocationName())
                .locationContent(request.getLocationContent())
                .locationUrl(request.getLocationUrl())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();
    }

    public ActivityRequest toRequest() {
        return new ActivityRequest(
                this.activityType,
                this.locationName,
                this.locationContent,
                this.locationUrl,
                this.address,
                this.latitude,
                this.longitude
        );
    }
}
