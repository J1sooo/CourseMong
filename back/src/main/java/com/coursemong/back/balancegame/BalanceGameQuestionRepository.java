package com.coursemong.back.balancegame;

import com.coursemong.back.balancegame.domain.BalanceGameQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BalanceGameQuestionRepository extends JpaRepository<BalanceGameQuestion, Long> {
}
