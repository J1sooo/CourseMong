package com.coursemong.back.datecourse;

import com.coursemong.back.datecourse.domain.ActivityType;
import com.coursemong.back.datecourse.dto.ActivityRequest;
import com.coursemong.back.datecourse.dto.ActivityTempResponse;
import com.coursemong.back.datecourse.dto.DateCourseRequest;
import com.coursemong.back.datecourse.dto.DateCourseTempResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

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

            log.info("임시 저장 완료 tempId: {}", tempId);
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
                throw new RuntimeException("임시 데이터 찾을 수 없음 tempId: " + tempId);
            }

            return objectMapper.convertValue(cached, DateCourseTempResponse.class);

        } catch (Exception e) {
            log.error("임시 데이터 조회 실패. tempId: {}", tempId, e);
            throw new RuntimeException("임시 데이터 조회 실패 tempId: " + tempId + e);
        }
    }

    public DateCourseTempResponse updateActivityByType(String tempId, ActivityType activityType, ActivityRequest newActivity) {
        String key = TEMP_KEY_PREFIX + tempId;

        try {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached == null) {
                log.warn("임시 데이터 찾을 수 없음 tempId: {}", tempId);
                throw new RuntimeException("임시 데이터 찾을 수 없음 tempId: " + tempId);
            }

            DateCourseTempResponse tempResponse = objectMapper.convertValue(cached, DateCourseTempResponse.class);

            var activities = tempResponse.getActivities();
            boolean found = false;

            if (newActivity.getActivityType() != null && newActivity.getActivityType() != activityType) {
                log.warn("URL의 activityType({})과 Request activityType({})이 일치하지 않음",
                        activityType, newActivity.getActivityType());
                throw new IllegalArgumentException("URL의 activityType과 Request의 activityType이 일치하지 않음");
            }

            for (int i = 0; i < activities.size(); i++) {
                var activity = activities.get(i);
                if (activity.getActivityType() == activityType) {
                    var updatedActivity = ActivityTempResponse.builder()
                            .activityType(newActivity.getActivityType())
                            .locationName(newActivity.getLocationName())
                            .locationContent(newActivity.getLocationContent())
                            .locationUrl(newActivity.getLocationUrl())
                            .address(newActivity.getAddress())
                            .latitude(newActivity.getLatitude())
                            .longitude(newActivity.getLongitude())
                            .build();

                    activities.set(i, updatedActivity);
                    found = true;
                    log.info("{} 타입 activity 수정 완료 tempId: {}", activityType, tempId);
                    break;
                }
            }

            if (!found) {
                log.warn("{} 타입 activity를 찾을 수 없음 tempId: {}", activityType, tempId);
                throw new RuntimeException(activityType + "의 activity를 찾을 수 없음 tempId: " + tempId);
            }

            redisTemplate.opsForValue().set(key, tempResponse, TEMP_TTL_HOURS, TimeUnit.HOURS);
            log.info("Redis 업데이트 완료 tempId: {}", tempId);

            return tempResponse;

        } catch (Exception e) {
            log.error("Activity 수정 실패 tempId: {}, Type: {}", tempId, activityType, e);
            throw new RuntimeException("Activity 수정 실패 tempId: " + tempId + "Type: " + activityType + e);
        }
    }

    public void deleteTemporary(String tempId) {
        String key = TEMP_KEY_PREFIX + tempId;
        try {
            redisTemplate.delete(key);
            log.info("임시 데이터 삭제 완료 tempId: {}", tempId);
        } catch (Exception e) {
            log.error("임시 데이터 삭제 실패 tempId: {}", tempId, e);
        }
    }
}
