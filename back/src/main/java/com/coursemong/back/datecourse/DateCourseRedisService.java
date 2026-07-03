package com.coursemong.back.datecourse;

import com.coursemong.back.datecourse.domain.ActivityType;
import com.coursemong.back.datecourse.dto.ActivityRequest;
import com.coursemong.back.datecourse.dto.ActivityTempResponse;
import com.coursemong.back.datecourse.dto.DateCourseRequest;
import com.coursemong.back.datecourse.dto.DateCourseTempResponse;
import com.coursemong.back.datecourse.dto.TempCourseSummary;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@RequiredArgsConstructor
@Service
public class DateCourseRedisService {

    private static final String TEMP_KEY_PREFIX = "temp:datecourse:";
    private static final long TEMP_TTL_HOURS = 6;

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public String saveTemporary(DateCourseRequest request) {
        String tempId = UUID.randomUUID().toString();
        String key = TEMP_KEY_PREFIX + tempId;
        try {
            DateCourseTempResponse tempResponse = DateCourseTempResponse.fromRequest(request, tempId);
            redisTemplate.opsForValue().set(key, tempResponse, TEMP_TTL_HOURS, TimeUnit.HOURS);
            log.debug("임시 저장 완료 tempId: {}", tempId);
            return tempId;
        } catch (Exception e) {
            throw new RuntimeException("임시 저장 실패", e);
        }
    }

    public DateCourseTempResponse getTemporary(String tempId) {
        String key = TEMP_KEY_PREFIX + tempId;
        try {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached == null) {
                log.warn("임시 데이터 찾을 수 없음 tempId: {}", tempId);
                throw new EntityNotFoundException("임시 데이터를 찾을 수 없음");
            }
            return objectMapper.convertValue(cached, DateCourseTempResponse.class);
        } catch (EntityNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("임시 데이터 조회 실패 tempId: {}", tempId, e);
            throw new RuntimeException("임시 데이터 조회 실패", e);
        }
    }

    // 대시보드용 — 현재 Redis에 남아있는 임시 코스 전체 + 각각의 남은 TTL 조회
    // KEYS는 Redis 싱글스레드를 블로킹하는 O(N) 명령어라 데이터가 많아지면 SCAN 커서 방식으로 바꿔야 함
    // (지금은 임시 코스 TTL이 6시간이라 동시 보관량이 적어 KEYS로도 충분함)
    public List<TempCourseSummary> getAllTemporarySummaries() {
        try {
            Set<String> keys = redisTemplate.keys(TEMP_KEY_PREFIX + "*");
            if (keys == null || keys.isEmpty()) {
                return List.of();
            }

            return keys.stream()
                    .map(this::toTempCourseSummary)
                    .filter(Objects::nonNull)
                    .sorted(Comparator.comparingLong(TempCourseSummary::remainingTtlSeconds))
                    .toList();
        } catch (Exception e) {
            log.error("임시 코스 목록 조회 실패", e);
            throw new RuntimeException("임시 코스 목록 조회 실패", e);
        }
    }

    private TempCourseSummary toTempCourseSummary(String key) {
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached == null) {
            // keys() 조회 이후 TTL 만료로 사라진 경우 -> 목록에서 제외
            return null;
        }

        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        DateCourseTempResponse tempResponse = objectMapper.convertValue(cached, DateCourseTempResponse.class);
        return new TempCourseSummary(
                tempResponse.getTempId(),
                tempResponse.getTitle(),
                tempResponse.getArea(),
                ttl != null ? ttl : 0);
    }

    public DateCourseTempResponse updateActivityByType(
            String tempId, ActivityType activityType, ActivityRequest newActivity, List<String> excludedLocationNames) {
        String key = TEMP_KEY_PREFIX + tempId;
        try {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached == null) {
                log.warn("임시 데이터 찾을 수 없음 tempId: {}", tempId);
                throw new EntityNotFoundException("임시 데이터를 찾을 수 없음");
            }

            DateCourseTempResponse tempResponse = objectMapper.convertValue(cached, DateCourseTempResponse.class);
            List<ActivityTempResponse> activities = tempResponse.getActivities();

            if (newActivity.getActivityType() != null && newActivity.getActivityType() != activityType) {
                log.warn("URL의 activityType({})과 Request activityType({})이 일치하지 않음", activityType, newActivity.getActivityType());
                throw new IllegalArgumentException("URL의 activityType과 Request의 activityType이 일치하지 않음");
            }

            boolean found = false;
            for (int i = 0; i < activities.size(); i++) {
                if (activities.get(i).getActivityType() == activityType) {
                    activities.set(i, ActivityTempResponse.builder()
                            .activityType(activityType)
                            .locationName(newActivity.getLocationName())
                            .locationContent(newActivity.getLocationContent())
                            .locationUrl(newActivity.getLocationUrl())
                            .address(newActivity.getAddress())
                            .latitude(newActivity.getLatitude())
                            .longitude(newActivity.getLongitude())
                            .excludedLocationNames(excludedLocationNames)
                            .build());
                    found = true;
                    break;
                }
            }

            if (!found) {
                log.warn("{} 타입 activity를 찾을 수 없음 tempId: {}", activityType, tempId);
                throw new EntityNotFoundException(activityType + " 타입의 activity를 찾을 수 없음");
            }

            redisTemplate.opsForValue().set(key, tempResponse, TEMP_TTL_HOURS, TimeUnit.HOURS);
            return tempResponse;

        } catch (EntityNotFoundException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Activity 수정 실패 tempId: {}, Type: {}", tempId, activityType, e);
            throw new RuntimeException("Activity 수정 실패", e);
        }
    }

    public void deleteTemporary(String tempId) {
        String key = TEMP_KEY_PREFIX + tempId;
        try {
            redisTemplate.delete(key);
            log.debug("임시 데이터 삭제 완료 tempId: {}", tempId);
        } catch (Exception e) {
            log.error("임시 데이터 삭제 실패 tempId: {}", tempId, e);
        }
    }
}
