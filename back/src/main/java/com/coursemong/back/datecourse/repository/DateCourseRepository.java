package com.coursemong.back.datecourse.repository;

import com.coursemong.back.datecourse.domain.DateCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DateCourseRepository extends JpaRepository<DateCourse, Long> {
    Optional<DateCourse> findByCourseUuid(UUID courseUuid);
}
