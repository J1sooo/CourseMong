package com.coursemong.back.balancegame.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "balance_game_question")
@Getter
@NoArgsConstructor
public class BalanceGameQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id", nullable = false)
    private Long id;

    @Column(name = "question_content", length = 50, nullable = false)
    private String questionContent;

    @Column(name = "answer_a", length = 20, nullable = false)
    private String answerA;

    @Column(name = "answer_b", length = 20, nullable = false)
    private String answerB;
}

