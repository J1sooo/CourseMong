# 🌙 코스몽 (CourseMong)

> 꿈 같은 코스를 AI 제미나이가 짜준다

- 작업 기간: 2026.02 - 2026.05
- 인원: 1명

## 📌 프로젝트 소개

**코스몽**은 AI(Gemini)가 사용자의 취향과 상황에 맞는 데이트 코스를 추천해주는 서비스입니다.

지역, 날짜, 관계, 취미, 테마를 입력하면 카카오 로컬 API로 실제 장소를 검색하고 Gemini가 최적의 코스를 구성해줍니다. 마음에 안 드는 활동은 이유와 함께 부분 재추천을 받을 수 있고, 완성된 코스는 게시판에 공유할 수 있습니다.

## 🧭 서비스 흐름

```
1. 사용자 입력
   지역 · 날짜 · 관계 · 취미 · 테마 · 활동(오전/점심/오후/저녁) 선택

2. 후보 수집 + AI 코스 구성
   활동마다 카카오 로컬 API로 후보 장소 5개 검색
   → 후보 전체를 Gemini에 전달, 코스 전체 흐름을 고려해 활동당 1곳씩 선택
   → 결과는 Redis에 임시 저장 (tempId, TTL 6시간)

3. 확인 및 부분 재추천
   지도에서 코스를 확인하고, 마음에 안 드는 활동만
   이유(비싸요 / 멀어요 / 가봤어요 등)를 골라 개별 재추천 요청
   → Redis에 저장된 코스 컨텍스트를 함께 전달해 해당 활동만 다시 추천

4. 확정 및 공유
   MySQL에 영구 저장, UUID로 조회 가능
   원하면 게시판에 공개 (비가역)
```

AI는 2단계(최초 코스 구성)와 3단계(부분 재추천) 두 지점에 관여합니다. 재추천 시에도 코스 전체 맥락을 유지해야 하기 때문에, 매번 새로 추천하는 게 아니라 Redis에 저장된 기존 코스 상태를 함께 전달하는 구조로 설계했습니다.

## 🤖 AI 추천 엔진 — 핵심 컴포넌트

| 항목 | 내용 |
|---|---|
| **입력** | 사용자 조건(지역/관계/날짜/취미/테마) + 활동별 카카오 후보 장소 리스트(활동당 5개) |
| **출력** | 활동별로 선택된 장소 1곳 (JSON) |
| **경계** | 후보 검색(카카오 API)과 후보 선택(Gemini API)을 완전히 분리. AI는 "후보 중 고르는 역할"만 담당하고, 장소 자체를 검색하는 책임은 갖지 않음 |
| **실시간 정보 반영** | Google Search 그라운딩을 적용해 후보 장소의 실제 가격대·분위기·영업시간을 검색 기반으로 판단, 날짜·요일·공휴일을 고려해 영업 중인 장소만 추천 |
| **실패 시 동작** | ① API 레벨 실패(503/429 등): `@Retryable`로 2s → 4s → 8s 자동 재시도 ② 응답이 JSON이 아님(그라운딩 사용 시 거절 응답 등): 최대 3회까지 자동 재파싱 시도 ③ 모두 실패: 사용자에게 토스트 메시지로 안내 |
| **상태 관리** | 추천 결과는 즉시 DB에 저장하지 않고 Redis에 임시 저장(TTL 6시간). 재추천 시 이 임시 상태를 컨텍스트로 다시 Gemini에 전달 |

## 🧩 구조적으로 고민했던 지점

**왜 Redis에 임시 저장하는가**
부분 재추천은 "코스 전체 맥락"을 알아야 활동 하나만 자연스럽게 바꿀 수 있습니다. 매 재추천마다 프론트가 전체 코스 상태를 다시 보내는 대신, 서버가 Redis에 상태를 들고 있다가 컨텍스트로 재사용하는 쪽을 선택했습니다. 확정 전 코스까지 MySQL에 쌓이면 불필요한 영구 데이터가 늘어나는 것도 피하고 싶었습니다.

**왜 tempId(Redis)와 courseUuid(MySQL)를 분리했는가**
"아직 확정 안 된 코스"와 "영구 저장된 코스"는 조회 방식과 만료 정책이 다릅니다. 하나의 식별자로 묶으면 TTL 로직과 영구 저장 로직이 서로 얽히기 때문에, 역할이 다른 두 식별자로 분리했습니다.

**지금 단계에서의 한계와 확장 방향**
- Gemini 응답 파싱은 문자열 기반 JSON 추출 방식입니다. 응답 스키마가 더 복잡해지면 구조화된 함수 호출(function calling) 방식으로 전환할 필요가 있습니다.
- 음식 카테고리를 대분류 → 세부 항목(한식 → 국밥/감자탕/찜닭) 2단계로 확장한 것처럼, 다른 활동 카테고리도 사용자 데이터가 쌓이면 세분화할 계획입니다.

## 🌐 배포 사이트
🔗 [https://course-mong.vercel.app](https://course-mong.vercel.app/)

## 🎨 초기 디자인
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)</br>
🔗 [Figma 바로 보기](https://www.figma.com/design/6zxcguAkMHcJU6Gt3qC8Yq/%EC%BD%94%EC%8A%A4%EB%AA%BD?node-id=0-1&t=OWvMkKtjbsV62MtN-1)

## 😎 Stack

### 💻 프론트엔드

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI_v5-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)

### 🔧 백엔드

![Java](https://img.shields.io/badge/Java_17-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![JPA](https://img.shields.io/badge/Spring_Data_JPA-59666C?style=for-the-badge&logo=hibernate&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white)

### 🛢️ 데이터베이스

![MySQL](https://img.shields.io/badge/MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![H2](https://img.shields.io/badge/H2-006699?style=for-the-badge&logo=h2&logoColor=white)

### ☁️ 인프라

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

### 🧪 기타

![Gemini](https://img.shields.io/badge/Google_Gemini_API-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Kakao](https://img.shields.io/badge/Kakao_Local_API-FFCD00?style=for-the-badge&logo=kakao&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ_IDEA-000000?style=for-the-badge&logo=intellijidea&logoColor=white)

## 🔑 핵심 기능

### 🤖 AI 데이트 코스 추천
- 지역 / 날짜 / 관계 / 취미 / 테마 / 활동 종류 선택
- 활동별 카카오 로컬 API로 장소 5개 검색 후 Gemini가 최적 1개 선택
- 오전 → 점심 → 오후 → 저녁 순으로 코스 구성
- *(동작 원리는 위 [AI 추천 엔진](#-ai-추천-엔진--핵심-컴포넌트) 섹션 참고)*

### 🗺️ 카카오맵 시각화
- 번호 마커로 활동 순서 표시
- 점선 경로로 코스 동선 연결
- 중간에 빠진 활동은 자동으로 건너뜀

### 🔄 부분 재추천
- 마음에 안 드는 카드만 이유 선택 후 개별 재추천
- 재추천 중인 카드에 개별 로딩 스피너 표시

### 💾 임시 저장 및 확정
- Redis TTL 6시간 임시 저장 (UUID로 조회)
- 확정 시 커스텀 제목 입력 후 DB 저장
- 메뉴에서 저장 전 코스 / 내가 짠 코스 / 최근 본 코스 관리

### 📋 게시판 공유
- 확정 코스를 게시판에 공개 (한 번 공개하면 되돌릴 수 없음)

## 🛠️ 베타 테스트 피드백 반영 (Update)

배포 후 부트캠프 동료들을 대상으로 베타 테스트를 진행하고, 실제 사용 피드백을 받아 아래 항목들을 개선했습니다.

| 피드백 | 개선 내용 |
|---|---|
| 코스 생성 시 로딩 화면이 없어 지루함 | 전체 화면 로딩 오버레이 추가, 안내 문구가 순환되도록 구현 |
| 재추천해도 카카오맵이 갱신되지 않음 | `useEffect` 의존성을 좌표 기반으로 변경해 지도 갱신 버그 수정 |
| 점심/저녁 등 활동이 같은 장소로 중복 추천됨 | 재추천 시 같은 코스 내 다른 활동 정보를 함께 전달해 중복 선택 방지 |
| 재추천을 반복하면 이전에 나왔던 장소가 다시 등장 | Redis에 제외 장소 이력을 누적 저장해 재등장 방지 |
| 재추천 이유("너무 멀어요" 등)가 결과에 잘 반영되지 않음 | 다른 활동들의 좌표를 함께 전달해 거리 기반으로 후보 비교 |
| 음식 카테고리 선택지가 너무 적음 | 대분류 → 세부 항목(예: 한식 → 국밥/감자탕/찜닭) 2단계 선택 구조로 확장 |

## 🖼️ 핵심 기능 스크린샷

### 메인 화면 (게시판)
<img width="1086" height="857" alt="코스몽 메인" src="https://github.com/user-attachments/assets/eddf15e7-d951-4cef-a4de-27e0f8e3489c" />
<img width="1080" height="472" alt="코스몽 게시판" src="https://github.com/user-attachments/assets/cf43c305-5251-4ec9-bbed-20c91e400868" />

### 코스 생성 화면
<img width="872" height="876" alt="코스몽 생성화면" src="https://github.com/user-attachments/assets/25da2c33-c287-4028-ada8-15dd61680f59" />

### 추천 결과 화면
<img width="877" height="822" alt="코스몽 결과 화면" src="https://github.com/user-attachments/assets/495821cb-7f5d-475e-af45-c13db53bffd2" />

### 코스 상세 화면
<img width="880" height="882" alt="코스몽 상세화면" src="https://github.com/user-attachments/assets/fe5864a6-1fa8-4c34-8ff8-256325e7cb2e" />

### 메뉴 화면
<img width="867" height="811" alt="코스몽 메뉴 화면" src="https://github.com/user-attachments/assets/5516de03-0950-4f77-a771-c9b462221bde" />

## 🏗️ 아키텍처

```
[Vercel] React + TypeScript
    ↓ HTTPS
[EC2] Nginx (443 → 8080)
    ↓
[Docker] Spring Boot App
    ├── MySQL  (코스 영구 저장)
    └── Redis  (코스 임시 저장, TTL 6h)
```

*(요청/응답이 오가는 전체 흐름은 위 [서비스 흐름](#-서비스-흐름) 섹션 참고)*

## 🗄️ ERD

<!-- ERD 이미지 -->
<!-- ![코스몽 ERD](docs/erd.png) -->

**course**

| Column | Type | Description |
|--------|------|-------------|
| course_id | BIGINT | 코스 ID (PK) |
| title | VARCHAR(20) | 코스 제목 |
| area | VARCHAR(10) | 지역 |
| course_uuid | BINARY(16) | 코스 UUID |
| published | BOOLEAN | 게시판 공개 여부 |
| created_at | DATETIME | 생성일 |
| last_viewed_at | DATETIME | 마지막 열람일 |

**activity**

| Column | Type | Description |
|--------|------|-------------|
| activity_id | BIGINT | 활동 ID (PK) |
| course_id | BIGINT | 코스 ID (FK) |
| activity_type | ENUM | MORNING / LUNCH / AFTERNOON / DINNER |
| location_name | VARCHAR(20) | 장소명 |
| location_content | VARCHAR(255) | 장소 설명 |
| location_url | VARCHAR(100) | 장소 URL |
| address | VARCHAR(50) | 주소 |
| latitude | DOUBLE | 위도 |
| longitude | DOUBLE | 경도 |

## 📡 API 명세

| Method | URL | 설명 |
|---|---|---|
| POST | `/api/gemini` | AI 데이트 코스 추천 생성 |
| GET | `/api/date-courses/board` | 게시판 공개 코스 목록 조회 |
| GET | `/api/date-courses?uuid={courseUuid}` | UUID로 코스 조회 |
| GET | `/api/date-courses/{courseId}` | ID로 코스 조회 |
| POST | `/api/date-courses` | 코스 직접 생성 (테스트용) |
| DELETE | `/api/date-courses/{courseId}` | 코스 삭제 |
| PATCH | `/api/date-courses/{uuid}/publish` | 코스 게시판 공개 전환 |
| POST | `/api/date-courses/temporary` | Redis 임시 코스 저장 |
| GET | `/api/date-courses/temporary/{tempId}` | Redis 임시 코스 조회 |
| PATCH | `/api/date-courses/temporary/{tempId}/activities/{type}` | 활동 부분 재추천 |
| POST | `/api/date-courses/temporary/{tempId}?published=&title=` | 임시 코스 DB 저장 확정 |
| GET | `/api/kakao/search?query=&page=&size=` | 카카오 장소 키워드 검색 |
