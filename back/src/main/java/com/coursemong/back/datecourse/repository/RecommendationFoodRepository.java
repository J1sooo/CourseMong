package com.coursemong.back.datecourse.repository;

import com.coursemong.back.datecourse.domain.RecommendationFood;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendationFoodRepository extends JpaRepository<RecommendationFood, Long> {
}
