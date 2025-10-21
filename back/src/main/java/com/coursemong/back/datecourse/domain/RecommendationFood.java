package com.coursemong.back.datecourse.domain;

import com.coursemong.back.datecourse.dto.RecommendationFoodResponse;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recommendation_food")
@Getter
@NoArgsConstructor
public class RecommendationFood {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_id")
    private Long id;

    @Column(name = "food_name")
    private String foodName;

    @Column(name = "food_price")
    private Integer foodPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id")
    private Activity activity;

    public RecommendationFood(String foodName, Integer foodPrice, Activity activity) {
        this.foodName = foodName;
        this.foodPrice = foodPrice;
        this.activity = activity;
    }

    public RecommendationFoodResponse recommendationFoodToDto() {
        return new RecommendationFoodResponse(this);
    }
}