package com.coursemong.back.datecourse.repository;

import com.coursemong.back.datecourse.domain.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
}
