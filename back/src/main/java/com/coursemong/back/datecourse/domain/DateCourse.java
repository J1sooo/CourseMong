package com.coursemong.back.datecourse.domain;

import com.coursemong.back.datecourse.dto.DateCourseRequest;
import com.coursemong.back.datecourse.dto.DateCourseResponse;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "date_course")
@Getter
@NoArgsConstructor
public class DateCourse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "area", nullable = false)
    private String area;

    @Column(name = "course_uuid", nullable = false, columnDefinition = "BINARY(16)", unique = true)
    private UUID courseUuid;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_viewed_at")
    private LocalDateTime lastViewedAt;

    @OneToMany(mappedBy = "dateCourse", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Activity> activities = new ArrayList<>();

    @PrePersist
    private void onCreate() {
        this.courseUuid = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
        this.lastViewedAt = LocalDateTime.now();
    }

    public DateCourse(DateCourseRequest request) {
        this.title = request.getTitle();
        this.area = request.getArea();
        this.published = request.isPublished();
    }

    public DateCourseResponse dateCourseToDto() {
        return new DateCourseResponse(this);
    }

    public void updateLastViewedAt() {
        this.lastViewedAt = LocalDateTime.now();
    }

    public void publish() {
        this.published = true;
    }
}
