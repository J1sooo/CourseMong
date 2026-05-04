package com.coursemong.back.naver;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class NaverSearchController {
    private final NaverSearchService naverSearchService;

    @GetMapping("/naverSearch")
    public String search(@RequestParam String query) {
        return naverSearchService.searchPlaces(query);
    }

}
