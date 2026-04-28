package com.coursemong.back.gemini;

import java.time.LocalDate;
import java.util.List;


public record GeminiRequest (
        String area,
        String relationship,
        LocalDate date,
        List<String> hobby,
        String theme,
        List<String> activity
) {

}

