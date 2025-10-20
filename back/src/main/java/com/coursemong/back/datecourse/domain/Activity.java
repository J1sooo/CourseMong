package com.coursemong.back.datecourse.domain;

import jakarta.persistence.*;
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

    @Column(name = "activity_name", nullable = false)
    private String activityName;

    @Column(name = "activity_content", nullable = false)
    private String activityContent;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "tell_number")
    private String tellNumber;

    @Column(name = "running_time")
    private String runningTime;

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
}
