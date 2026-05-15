# 🌙 코스몽 (CourseMong)

> 꿈 같은 코스를 AI 제미나이가 짜준다

- 작업 기간: 2026.02 - 2026.05
- 인원: 1명

## 📌 프로젝트 소개

**코스몽**은 AI(Gemini)가 사용자의 취향과 상황에 맞는 데이트 코스를 추천해주는 서비스입니다.

지역, 날짜, 관계, 취미, 테마를 입력하면 카카오 로컬 API로 실제 장소를 검색하고 Gemini가 최적의 코스를 구성해줍니다. 마음에 안 드는 활동은 이유와 함께 부분 재추천을 받을 수 있고, 완성된 코스는 게시판에 공유할 수 있습니다.

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

### AI 추천 플로우

```
사용자 입력 (지역, 관계, 날짜, 취미, 테마, 활동)
    ↓
활동별 카카오 로컬 API 검색 (활동당 후보 5개)
    ↓
Gemini API — 전체 코스 흐름을 보며 후보 중 1개씩 선택
    ↓
Redis 임시 저장 (tempId, TTL 6h)
    ↓
결과 페이지 표시 → 부분 재추천 / 확정
    ↓
(확정) MySQL 영구 저장 → UUID로 조회 가능
```

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
|--------|-----|------|
| POST | `/api/gemini` | AI 코스 추천 생성 |
| GET | `/api/date-courses/temporary/{tempId}` | Redis 임시 코스 조회 |
| PATCH | `/api/date-courses/temporary/{tempId}/activities/{type}` | 활동 부분 재추천 |
| POST | `/api/date-courses/temporary/{tempId}` | 임시 코스 DB 저장 확정 |
| GET | `/api/date-courses?uuid={courseUuid}` | UUID로 코스 조회 |
| GET | `/api/date-courses/board` | 게시판 공개 코스 목록 |
| PATCH | `/api/date-courses/{uuid}/publish` | 코스 게시판 공개 |

