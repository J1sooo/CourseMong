package com.coursemong.back.datecourse.dto;

import com.coursemong.back.datecourse.domain.RecommendationFood;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RecommendationFoodResponse {
    private Long id;
    private String foodName;
    private Integer foodPrice;
    private Long activityId;

    public RecommendationFoodResponse(RecommendationFood recommendationFood) {
        this.id = recommendationFood.getId();
        this.foodName = recommendationFood.getFoodName();
        this.foodPrice = recommendationFood.getFoodPrice();
        this.activityId = recommendationFood.getActivity().getId();
    }
}