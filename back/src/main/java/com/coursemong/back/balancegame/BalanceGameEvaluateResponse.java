package com.coursemong.back.balancegame;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BalanceGameEvaluateResponse {

    private Map<String, Integer> scores;    // "P":3, "R":-2, "C":1
    private Map<String, String> polarity;   // "P":"+","R":"-","C":"-"
    private TypePayload type;

    // 전체 참여자 수
    private long totalParticipants;

    // 유형 비율
    private double typePercentage;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TypePayload {
        private Integer id;     // 유형 1~8
        private String code;    // P- R+ C+
        private String name;    // 유형 이름
        private String summary; // 설명
        private List<String> hashtags;   // 특징
        private List<Integer> best_match;   // 잘 맞는 유형
        private List<Integer> worst_match;  // 안 맞는 유형
    }
}
