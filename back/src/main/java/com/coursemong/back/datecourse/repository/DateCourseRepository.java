package com.coursemong.back.datecourse.repository;

import com.coursemong.back.datecourse.domain.DateCourse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DateCourseRepository extends JpaRepository<DateCourse, Long> {
}
