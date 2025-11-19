package com.coursemong.back.balancegame;

import com.coursemong.back.balancegame.domain.BalanceGameResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BalanceGameResultRepository extends JpaRepository<BalanceGameResult, Long> {
    Optional<BalanceGameResult> findByBalanceCode(String balanceCode);
}
