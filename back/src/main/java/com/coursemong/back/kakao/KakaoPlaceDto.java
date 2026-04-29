package com.coursemong.back.kakao;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record KakaoPlaceDto(
        @JsonProperty("address_name") String addressName,
        @JsonProperty("phone") String phone,
        @JsonProperty("place_name") String placeName,
        @JsonProperty("place_url") String placeUrl,
        @JsonProperty("road_address_name") String roadAddressName,
        @JsonProperty("x") String x,
        @JsonProperty("y") String y
) {}
