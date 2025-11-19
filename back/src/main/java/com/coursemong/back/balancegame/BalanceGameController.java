package com.coursemong.back.balancegame;

import com.coursemong.back.balancegame.domain.BalanceGameQuestion;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/balance-game")
@RequiredArgsConstructor
public class BalanceGameController {

    private final BalanceGameQuestionRepository questionRepository;
    private final BalanceGameService service;

    // 질문 목록 조회
    @GetMapping("/questions")
    public List<BalanceGameQuestion> getQuestions() {
        return questionRepository.findAll();
    }

    // 채점
    @PostMapping("/evaluate")
    public BalanceGameEvaluateResponse evaluate(@RequestBody BalanceGameAnswerRequest request) {
        return service.evaluate(request);
    }
}
