package com.coursemong.back.kakao;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/kakao")
@RequiredArgsConstructor
public class KakaoSearchController {

    private final KakaoSearchService kakaoSearchService;

    @GetMapping("/search")
    public List<KakaoPlaceDto> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return kakaoSearchService.searchPlaces(query, page, size);
    }

    @GetMapping("/place")
    public List<String> searchPlace(
            @RequestParam String query,
            @RequestParam(defaultValue = "5") int size
    ) {
        return kakaoSearchService.searchPlaceNames(query, size);
    }

    @GetMapping("/address")
    public List<String> searchAddress(
            @RequestParam String query,
            @RequestParam(defaultValue = "5") int size
    ) {
        return kakaoSearchService.searchAddressNames(query, size);
    }
}
