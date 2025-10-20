package com.coursemong.back.balancegame.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "balance_game_result")
@Getter
@NoArgsConstructor
public class BalanceGameResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "balance_id", nullable = false)
    private Long id;

    @Column(name = "balance_name", length = 20, nullable = false)
    private String balanceName;

    @Column(name = "balance_content", length = 255, nullable = false)
    private String balanceContent;

    @Column(name = "character", length = 255, nullable = false)
    private String character;

    @Column(name = "good_match", length = 255, nullable = false)
    private String goodMatch;

    @Column(name = "not_good_match", length = 255, nullable = false)
    private String notGoodMatch;
}
