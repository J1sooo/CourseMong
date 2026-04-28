package com.coursemong.back.gemini;

import com.coursemong.back.datecourse.dto.DateCourseTempResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class GeminiController {
    private final GeminiService geminiService;

    @PostMapping("/gemini")
    public ResponseEntity<DateCourseTempResponse> responseGemini(@RequestBody GeminiRequest request) {
        DateCourseTempResponse response = geminiService.generateText(request);
        return ResponseEntity.ok(response);
    }
}
