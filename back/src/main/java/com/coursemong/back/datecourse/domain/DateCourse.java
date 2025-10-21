package com.coursemong.back.datecourse.domain;

import com.coursemong.back.datecourse.dto.DateCourseRequest;
import com.coursemong.back.datecourse.dto.DateCourseResponse;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

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

    @Column(name = "password", nullable = false)
    private String password;

    // 자동 비밀번호 생성
    @PrePersist
    private void randomPassword() {
        this.password = UUID.randomUUID().toString().substring(0,6);
    }

    public DateCourse(DateCourseRequest request) {
        this.title = request.getTitle();
        this.area = request.getArea();
    }

    public DateCourseResponse dateCourseToDto() {
        return new DateCourseResponse(this);
    }
}
