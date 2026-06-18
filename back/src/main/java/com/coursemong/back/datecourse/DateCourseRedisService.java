package com.coursemong.back.datecourse;

import com.coursemong.back.datecourse.domain.ActivityType;
import com.coursemong.back.datecourse.dto.ActivityRequest;
import com.coursemong.back.datecourse.dto.ActivityTempResponse;
import com.coursemong.back.datecourse.dto.DateCourseRequest;
import com.coursemong.back.datecourse.dto.DateCourseTempResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
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
