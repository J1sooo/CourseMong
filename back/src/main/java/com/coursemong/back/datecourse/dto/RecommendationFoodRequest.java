package com.coursemong.back.datecourse.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RecommendationFoodRequest {
    private String foodName;
    private Integer foodPrice;
}