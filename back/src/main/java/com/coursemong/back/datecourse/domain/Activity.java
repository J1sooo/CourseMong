package com.coursemong.back.datecourse.domain;

import com.coursemong.back.datecourse.dto.ActivityResponse;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "activity")
@Getter
@NoArgsConstructor
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activity_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @Column(name = "location_name", nullable = false)
    private String locationName;

    @Column(name = "location_content", nullable = false)
    private String locationContent;

    @Column(name = "location_url", nullable = false)
    private String locationUrl;

    @Column(name = "address", nullable = true)
    private String address;

    // h2 임시 코드
    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

//    mysql 코드
//    @Column(columnDefinition = "DECIMAL(10,8)", nullable = false)
//    private BigDecimal latitude;
//
//    @Column(columnDefinition = "DECIMAL(11,8)", nullable = false)
//    private BigDecimal longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private DateCourse dateCourse;

    @Builder
    private Activity(ActivityType activityType, String locationName, String locationContent,
                     String locationUrl, String address, Double latitude, Double longitude,
                     DateCourse dateCourse) {
        this.activityType = activityType;
        this.locationName = locationName;
        this.locationContent = locationContent;
        this.locationUrl = locationUrl;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.dateCourse = dateCourse;
    }

    public ActivityResponse activityToDto() {
        return new ActivityResponse(this);
    }
}
