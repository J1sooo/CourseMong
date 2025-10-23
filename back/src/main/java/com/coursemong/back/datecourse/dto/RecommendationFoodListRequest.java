package com.coursemong.back.datecourse.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class RecommendationFoodListRequest {
    private List<RecommendationFoodRequest> recommendationFoods;
}