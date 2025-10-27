package com.coursemong.back.balancegame;

import lombok.Data;

import java.util.Map;

@Data
public class BalanceGameAnswerRequest {
    // answers: "1":"A", "2":"B", ...
    private Map<Integer, String> answers;
}
