package com.coursemong.back.datecourse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DateCourseTempResponse {
    private String tempId;
    private String title;
    private String area;
    private List<ActivityTempResponse> activities;

    public static DateCourseTempResponse fromRequest(DateCourseRequest request, String tempId) {
        return DateCourseTempResponse.builder()
                .tempId(tempId)
                .title(request.getTitle())
                .area(request.getArea())
                .activities(request.getActivities().stream()
                        .map(ActivityTempResponse::fromRequest)
                        .toList())
                .build();
    }

    public DateCourseRequest toRequest() {
        List<ActivityRequest> activityRequests = this.activities.stream()
                .map(ActivityTempResponse::toRequest)
                .toList();

        return new DateCourseRequest(
                this.title,
                this.area,
                activityRequests
        );
    }
}

