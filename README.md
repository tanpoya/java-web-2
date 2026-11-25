# 자바웹프로그래밍(2) - 포트폴리오 프로젝트

Spring Boot 4.1 · Java 25 · Thymeleaf · Spring Data JPA · MySQL · Spring Security · WebSocket(STOMP)

## 핵심 요약

| 주차 | 주제 | 연습문제 / 개선 | 핵심 구현 |
| ---- | ---- | --------------- | --------- |
| [2주차](#2주차---url-매핑과-컨트롤러) | URL 매핑 · 컨트롤러 | `/hello2`에 값 5개 출력 | `Model`로 `data1`~`data5` 전달, `/hello2` 누구나 접근 |
| [3주차](#3주차---포트폴리오-수정) | 포트폴리오 화면 | 아이콘 수정 · 상세 페이지 3개 | `detailed_ai/security/game.html`, 아이콘 CDN |
| [4주차](#4주차---사용자-정보-출력) | DB 연동(JPA) | 나이·성별 추가, 표로 출력 | `TestDB` 필드 추가, `th:each` |
| [5주차](#5주차---로그인-기능-개선) | 로그인 · 암호화 | 로그인 상태 유지, 비밀번호 확인 | `rememberMe()` 7일, `signup()` 검증 |
| [6주차](#6주차---권한-관리-개선) | 권한(ROLE) | 관리자 본인 보호, MANAGER 권한 | `checkNotSelf()`, `hasAnyRole()` |
| [7주차](#7주차---rest-api-개선) | REST API | 회원 검색, 오류 처리 모으기 | `?keyword=`, `@RestControllerAdvice` |
| [9주차](#9주차---게시판-crud) | 게시판 CRUD | 조회수, 내가 쓴 글 (+ 사용성 개선 2개) | `read()`, `/board/my`, `pageshow` |
| [10주차](#10주차---페이징--검색--댓글) | 페이징 · 검색 · 댓글 | 내가 쓴 글 페이징, 작성자 검색 (+ 댓글 넘침 수정) | `Pageable`, JPQL `searchByWriter()`, `overflow-wrap` |
| [11주차](#11주차---신청-바구니와-트랜잭션) | 파일 업로드 · 트랜잭션 | 신청 취소, 삭제 정리 | `@Transactional` + 변경 감지, `exists...()` 검사 |
| [12주차](#12주차---websocket-실시간-알림) | WebSocket 실시간 알림 | 취소 실시간, 댓글 알림 | 이벤트 발행, `write()`에 `@Transactional` |

- **상태** : 2 ~ 12주차 연습문제 모두 완료. 2026-11-25에 서버를 띄워 주차별로 다시 확인했다 (서버 로그 ERROR 0건).
- **작업 규칙** : 기존 코드는 지우지 않고 주석으로 남긴 뒤, 새 코드에 `[N주차 연습문제]` 표시를 붙였다.
- **주의** : DB 비밀번호는 `application-secret.properties`에만 두고 GitHub에 올리지 않는다.
- **반응형 웹** : 6단계 모두 완료. 휴대폰(320 ~ 414px)에서 모든 화면이 가로 스크롤 없이 보인다 → [반응형 웹](#반응형-웹)
- **디자인 개편** : 라이트 · 다크 모드 테마를 화면별로 적용 중 → [디자인 개편](#디자인-개편-라이트--다크-모드)
- 막혔던 문제와 해결 방법은 맨 아래 [문제 해결 기록](#문제-해결-기록)에 모았다.

---

## 2주차 - URL 매핑과 컨트롤러

**문제** : `/hello2` 페이지를 만들고 컨트롤러에서 5개의 값을 넘겨 화면에 출력한다.

**해결**

- `DemoController.hello2()`에서 `model.addAttribute()`로 `data1` ~ `data5`를 담았다.
- `hello2.html`에서 `th:text="${data1}"` 형태로 출력했다.
- `hello.html`의 링크 이름을 "두번째 헬로 페이지"로 바꾸고 주소는 `/hello2`로 통일했다.

**이유**

- 화면에 글자를 직접 쓰지 않고 **컨트롤러 → Model → 뷰** 순서로 넘겨야 나중에 DB 값으로 바꾸기 쉽다.
- `/hello2.html`이 아니라 `/hello2`로 쓴 이유 : templates 폴더의 파일은 직접 열 수 없고 컨트롤러의 URL 매핑을 거쳐야 한다. (2주차 404 오류의 원인)

**추가 수정 (11-25)** : 5주차 보안 설정 이후 `/hello2`가 잠겨 있어서, 누구나 보는 `/hello`의 링크를 누르면 로그인 화면으로 이동했다. → `SecurityConfig`에 `.requestMatchers("/hello2").permitAll()` 추가

---

## 3주차 - 포트폴리오 수정

**문제** : 기술(Services) 영역 4가지의 아이콘을 수정하고, 웹을 제외한 나머지 기술의 상세 페이지를 만든다.

**해결**

- `detailed_web.html`의 디자인을 재활용해 `detailed_ai.html`, `detailed_security.html`, `detailed_game.html`을 `resources/public`에 만들었다. 제목, 소개글, 기술 스택, 숙련도, 진행 방식만 분야에 맞게 바꿨다.
- `index.html`의 비어 있던 `Discover More` 링크(`href="#"`)를 각 상세 페이지로 연결했다.
- 아이콘 변경 : 보안 `bi-phone` → `bi-shield-lock`, 게임 `bi-google` → `bi-controller`
- AI 아이콘(`bi-anthropic`)이 안 보이던 문제 : 프로젝트의 `bootstrap-icons.css`가 예전 버전이었다. → 최신 아이콘 CDN 링크 추가
- `SecurityConfig`에 상세 페이지 3개를 `permitAll()`로 추가했다. (5주차부터 허용하지 않은 주소는 모두 잠김)

**이유**

- 상세 페이지는 데이터 없는 소개 페이지라서, 컨트롤러 없이 바로 열리는 `public` 폴더가 간단하다.
- 새 탭 링크에 `rel="noopener noreferrer"`를 붙여, 새로 열린 페이지가 원래 페이지를 조작하지 못하게 했다.

**추가 수정 (11-25)** : 9주차 제공 `index.html`로 덮어쓰면서(커밋 `71987c2`) 위 수정이 원래 템플릿으로 돌아가 있었다. → 아이콘 CDN, Discover More 링크 3개, 아이콘 2개를 다시 적용했다. (기존 줄은 주석으로 남김)

---

## 4주차 - 사용자 정보 출력

**문제** : TestDB 엔티티에 나이·성별 컬럼을 추가하고, 여러 사용자를 표로 출력한다.

**해결**

- `TestDB` 엔티티에 `Integer age`, `String gender` 필드를 추가했다.
- `TestService.findAll()`을 추가하고, `DemoController`에서 `users`로 전체 목록을 넘겼다.
- `testdb.html`은 1명만 출력하던 코드를 주석 처리하고, `th:each="user : ${users}"`로 표의 행을 반복했다.

**이유**

- `spring.jpa.hibernate.ddl-auto=update` 덕분에 엔티티에 필드만 추가하면 재시작할 때 컬럼이 자동으로 생긴다.
- 나이를 `int`가 아닌 `Integer`로 쓴 이유 : 기존 행은 나이가 비어 있다(null). `int`는 null을 담을 수 없어 오류가 난다.
- `findAll()`은 JpaRepository가 기본으로 제공한다.

> 참고 : 처음에는 데이터를 `testdb_update.sql`로 넣는다고 적었지만, 이 파일은 저장소에 없다. 데이터는 DB에 이미 들어 있다.

---

## 5주차 - 로그인 기능 개선

### ① 로그인 상태 유지 (remember-me)

**해결** : `SecurityConfig`의 로그아웃 설정 뒤에 `.rememberMe()` 추가

- `key("비밀키")` : 쿠키 위조 방지
- `tokenValiditySeconds(60 * 60 * 24 * 7)` : 7일 유지

**이유**

- 일반 로그인은 세션 쿠키(JSESSIONID)라서 브라우저를 닫으면 풀린다. remember-me는 별도 쿠키를 남겨 다시 접속해도 자동 로그인된다.
- `login.html` 체크박스 이름이 `remember-me`라서 시큐리티가 자동으로 인식한다.
- 로그아웃할 때는 `deleteCookies("JSESSIONID", "remember-me")`가 이 쿠키도 지운다.

### ② 비밀번호 확인 검증

**해결** : `MemberService.signup()`에서 `password`와 `passwordConfirm`이 다르면 `IllegalArgumentException("비밀번호가 일치하지 않습니다.")`. 컨트롤러는 이미 이 예외를 가입 화면 메시지로 보여 준다.

**이유**

- 검사를 화면이 아닌 **서비스**에 둔 이유 : 화면 검사는 개발자 도구로 우회할 수 있다. 7주차 회원 등록 API도 같은 `signup()`을 쓰므로 한 곳에서 화면과 API를 모두 막는다.
- 예외가 `save()` 전에 나므로 DB에 저장되지 않는다.

---

## 6주차 - 권한 관리 개선

### ① 관리자 본인 보호

**해결**

- `MemberService.checkNotSelf()` : `SecurityContextHolder`로 로그인 아이디를 꺼내, 변경·삭제 대상과 같으면 예외
- `changeRole()`, `deleteMember()`에서 호출 → "자기 자신의 권한 변경·삭제는 할 수 없습니다."

**이유**

- 관리자가 실수로 자기 권한을 바꾸거나 삭제하면 관리자가 0명이 될 수 있다.
- 컨트롤러는 `Principal`을 받을 수 있지만 서비스는 그럴 수 없어서 `SecurityContextHolder`를 썼다.
- 서비스에서 검사하므로 관리자 화면(6주차)과 REST API(7주차)에 같은 규칙이 적용된다.

### ② 매니저(MANAGER) 권한 추가

**해결**

- 허용 권한 목록 `ROLES`에 `"MANAGER"` 추가 (기존 줄은 주석)
- `SecurityConfig` : `.requestMatchers("/testdb").hasAnyRole("ADMIN", "MANAGER")`
- (추가 도전) `index.html` 회원목록 메뉴에 `sec:authorize="hasAnyRole('ADMIN', 'MANAGER')"`

**이유**

- `hasRole()`은 권한 하나, `hasAnyRole()`은 여러 권한 중 하나만 있으면 통과한다.
- URL 규칙은 위에서부터 검사하므로 `anyRequest()`보다 **위에** 넣었다.
- 메뉴 숨기기만으로는 주소 직접 입력을 막을 수 없어서 URL 규칙도 함께 넣었다.

| 주소        | USER | MANAGER | ADMIN |
| ----------- | ---- | ------- | ----- |
| /mypage     | ✓    | ✓       | ✓     |
| /testdb     | 403  | ✓       | ✓     |
| /admin/\*\* | 403  | 403     | ✓     |

---

## 7주차 - REST API 개선

### ① 회원 검색 API

**문제** : `GET /api/admin/members?keyword=student`처럼 아이디나 이름에 검색어가 들어간 회원만 조회한다.

**해결**

- `MemberRepository` : `findByUsernameContainingOrNameContainingOrderByIdAsc()`
- `MemberService.search(keyword)` : 검색어가 비면 전체, 있으면 검색 결과
- `AdminApiController` 목록 메서드에 `@RequestParam(required = false) String keyword`

**이유**

- 메서드 이름 규칙으로 JPA가 SQL을 만든다 : `Containing` → `LIKE '%검색어%'`, `Or` → `OR`, `OrderByIdAsc` → `ORDER BY id`
- `required = false` : 검색어 없이 호출해도 전체 목록이 나와야 한다. (없으면 400)
- 응답은 `MemberResponse`(DTO)라서 비밀번호가 노출되지 않는다.

### ② 오류 처리 한 곳에 모으기

**문제** : 등록·수정·삭제 메서드마다 같은 `try-catch`가 반복된다.

**해결**

- `ApiExceptionHandler` 클래스 + `@RestControllerAdvice`
- `@ExceptionHandler(IllegalArgumentException.class)` → `400 {"error": "메시지"}`
- `AdminApiController`의 기존 메서드 3개는 주석으로 남기고, try-catch 없는 새 메서드 추가

**이유**

- 같은 오류 처리가 여러 곳에 있으면 바꿀 때 빠뜨리기 쉽다. 모으면 컨트롤러에는 정상 흐름만 남는다.
- `@RestControllerAdvice(annotations = RestController.class)`로 **API 컨트롤러만** 적용했다. 화면 컨트롤러는 오류를 화면 메시지로 보여 줘야 하기 때문이다.
- 반환 타입을 `ResponseEntity<?>`에서 `ResponseEntity<MemberResponse>`, `ResponseEntity<Void>`로 정확하게 바꿨다.
- `server.error.include-stacktrace=never`로 오류 JSON에 서버 내부 정보가 나가지 않게 했다.

**결과 확인** (try-catch를 지우기 전과 같은 결과)

| 테스트                       | 결과                                               |
| ---------------------------- | -------------------------------------------------- |
| 검색 `?keyword=test`         | 200, 아이디·이름에 test 포함 회원만                |
| 같은 아이디로 등록           | 400 `이미 사용 중인 아이디입니다.`                 |
| 비밀번호 확인 불일치         | 400 `비밀번호가 일치하지 않습니다.`                |
| 권한 `SUPER`로 변경          | 400 `허용되지 않는 권한입니다 : SUPER`             |
| 관리자가 본인 권한 변경/삭제 | 400 `자기 자신의 권한 변경·삭제는 할 수 없습니다.` |
| USER 계정으로 관리자 API     | 403                                                |
| 회원 등록 / 삭제             | 201 / 204                                          |

---

## 9주차 - 게시판 CRUD

### ① 조회수

**바꾼 곳**

- `PostService.read(id)` 추가
- `BoardController.detail()` : `findById()` 대신 `read()` 호출 (기존 `detail()`은 주석)

**하는 일**

- `read(id)`는 글을 찾아 `viewCount`를 1 올리고 `save()`한다. id가 있으므로 UPDATE가 실행된다.
- 조회수만 바꾸고 `updatedAt`은 건드리지 않아서, 읽기만 해도 "수정됨"이 붙는 문제가 없다.
- 없는 글 번호는 `findById()`에서 404로 멈춘다.

### ② 내가 쓴 글 모아 보기

**바꾼 곳**

- `PostRepository.findByAuthor_UsernameOrderByIdDesc(String username)`
- `PostService.findMine(username)`
- `BoardController.my()` : `GET /board/my`

**하는 일**

- 이름 규칙 : `Author_Username` → 작성자의 username으로 `JOIN ... WHERE m.username = ?`, `OrderByIdDesc` → 최신 글이 위로
- `my()`는 로그인 아이디의 글만 조회하고 `listTitle = "내가 쓴 글"`을 넘겨 `board/list.html`을 재사용한다.
- `/board/my`는 `permitAll()`에 없어서 로그인하지 않으면 로그인 화면으로 간다. 설정 변경은 필요 없었다.

### 추가 개선 ① "내가 쓴 글"에서 전체 글로 돌아갈 수 없음

**문제** : "내가 쓴 글" 화면에도 버튼이 "내가 쓴 글"이라, 전체 목록으로 가려면 메인으로 나갔다가 다시 들어와야 했다.

**바꾼 곳**

- `BoardController.my()` : `model.addAttribute("myList", true);`
- `board/list.html` : 버튼 하나(주석 처리)를 아래 두 버튼으로 교체

```html
<a th:unless="${myList}" th:href="@{/board/my}" ...>내가 쓴 글</a>
<a th:if="${myList}" th:href="@{/board}" ...>전체 글 보기</a>
```

- `listTitle`(제목)과 `myList`(화면 종류)를 따로 둬서, 제목 문구를 바꿔도 버튼 동작은 그대로다.

### 추가 개선 ② 뒤로가기 시 조회수가 바로 바뀌지 않음

**문제** : 목록 → 글 상세(조회수 +1) → 뒤로가기를 하면 목록에 이전 조회수가 보였다.

**원인** : HTTP 캐시 문제가 아니었다 (서버는 이미 `no-cache, no-store`). 브라우저의 **뒤로/앞으로 캐시(bfcache)** 가 서버에 묻지 않고 이전 화면을 메모리에서 그대로 복원했다.

**바꾼 곳** : `board/list.html`의 `</body>` 앞

```html
<script>
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      location.reload();
    }
  });
</script>
```

- `event.persisted`가 `true`(bfcache에서 꺼낸 화면)일 때만 새로고침한다. 처음 열 때는 `false`라서 요청이 두 번 가거나 무한 새로고침되지 않는다.

**결과 확인**

| 하는 일                      | 결과                                 |
| ---------------------------- | ------------------------------------ |
| 같은 글 상세를 여러 번 열기  | 열 때마다 조회 +1, 목록에도 반영     |
| 로그인 → 내가 쓴 글          | 내 글만, 버튼이 "전체 글 보기"       |
| "전체 글 보기" 클릭          | 전체 목록, 버튼은 다시 "내가 쓴 글"  |
| 로그인 안 하고 `/board/my`   | 로그인 화면                          |

---

## 10주차 - 페이징 · 검색 · 댓글

### ① 내가 쓴 글 페이징

**문제** : 9주차 "내가 쓴 글"은 한 번에 전부 꺼냈다. 10개씩 나누고 페이지 번호를 붙인다.

**바꾼 곳**

- `PostRepository` : `Page<Post> findByAuthor_Username(String username, Pageable pageable);`
- `PostService.findMinePage(username, page)`
- `BoardController.my()` : 기존은 주석, `page` 파라미터를 받는 새 `my()`

**하는 일**

- 메서드 이름 조회도 맨 뒤에 `Pageable`만 더하면 `Page`가 된다. `LIMIT · OFFSET · count`는 스프링이 붙인다.
- 정렬은 `PageRequest.of(page, 10, Sort.by(DESC, "id"))`에 담아 넘긴다.
- `pageUrl = "/board/my"`를 넘겨야 페이지 링크가 `/board/my?page=1`이 되어 내 글 안에서 이동한다.

### ② 작성자로 검색

**문제** : 검색 범위를 "제목+내용 / 작성자" 중에서 고를 수 있게 한다.

**바꾼 곳**

- `PostRepository` : JPQL 메서드 추가

```java
@Query("SELECT p FROM Post p WHERE p.author.name LIKE %:name%")
Page<Post> searchByWriter(@Param("name") String name, Pageable pageable);
```

- `PostService.findPage(type, keyword, page)` : `writer`면 `searchByWriter()`, 아니면 기존 `findPage(keyword, page)`
- `BoardController.list()` : 기존은 주석, `@RequestParam(defaultValue = "all") String type`을 받는 새 `list()`

**하는 일**

- `p.author.name`은 글 → 작성자 → 이름으로 따라가며 JPA가 `JOIN`을 만든다.
- `:name`은 **파라미터 바인딩**이라 SQL 인젝션이 통하지 않는다.
- 검색 범위 선택 상자가 고른 값을 유지하고, 페이지 링크에도 `type=writer`가 붙는다.
- `writer`가 아닌 이상한 값은 `all`로 처리한다.

**결과 확인**

| 하는 일                      | 결과                              |
| ---------------------------- | --------------------------------- |
| admin → 내가 쓴 글           | 10개씩, 링크가 `/board/my?page=1` |
| 작성자 선택 + "관리" 검색    | 관리자의 글만                     |
| 제목+내용 선택 + 검색        | 제목·내용에 검색어가 들어간 글만  |
| 작성자 검색 결과 2페이지     | 주소에 `type=writer` 유지         |

### 추가 개선 - 댓글이 화면 밖으로 넘침

**문제** : 띄어쓰기 없이 긴 댓글(`ㅋㅋㅋ…`, 긴 주소)이 카드 밖으로 밀려나고 가로 스크롤이 생겼다.

**원인** : `white-space: pre-wrap`은 **공백이 있는 곳에서만** 줄을 바꾼다. 공백 없는 긴 글자는 끊을 곳이 없었다. 글 내용과 제목도 같은 문제였다.

**바꾼 곳** : `static/css/board.css` 맨 아래 (기존 줄은 그대로, 아래 규칙이 덮어씀)

```css
.comment-content,
.post-content,
.board-card h3,
.board-title {
  overflow-wrap: anywhere;
  word-break: break-word;
}
.comment-item > .d-flex > .post-meta {
  min-width: 0;
  overflow-wrap: anywhere;
}
.comment-list + form textarea {
  resize: vertical;
  max-width: 100%;
}
```

- `overflow-wrap: anywhere` : 자리가 없으면 단어 중간에서라도 줄을 바꾼다. (`word-break`는 예전 브라우저용 보조)
- `min-width: 0` : flex 항목이 긴 이름 때문에 삭제 버튼을 밀어내지 않게 한다.
- 댓글 입력창은 위아래로만 크기 조절 가능
- 공백이 있는 보통 문장은 전처럼 단어 단위로 줄이 바뀐다.

---

## 11주차 - 신청 바구니와 트랜잭션

### ① 신청 취소

**문제** : 내 신청 내역의 취소 버튼으로 신청을 취소한다. (신청 내역 삭제 + 신청 인원 - 1)

| 조건                                  | 어떻게 지켰나                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| 본인 신청만 취소 (남의 것은 403)      | 신청 회원과 로그인 아이디가 다르면 `AccessDeniedException` → 403 화면                       |
| 두 작업을 한 트랜잭션으로             | `cancel()`에 `@Transactional` → 하나라도 실패하면 둘 다 롤백                                |
| `save()` 없이 변경 감지로 인원 줄이기 | `post.setAppliedCount(... - 1)`만 하고 `save()`는 부르지 않는다                             |

**바꾼 곳**

- `EnrollmentService.cancel(enrollmentId, username)`

```java
@Transactional
public void cancel(Long enrollmentId, String username) {
    Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "신청 내역이 존재하지 않습니다."));
    if (!enrollment.getMember().getUsername().equals(username)) {
        throw new AccessDeniedException("본인의 신청만 취소할 수 있습니다.");
    }
    Post post = enrollment.getPost();
    post.setAppliedCount(Math.max(post.getAppliedCount() - 1, 0)); // save() 없음
    enrollmentRepository.delete(enrollment);
}
```

- `CartController` : `POST /cart/enrollments/{id}/cancel` → 성공하면 "신청이 취소되었습니다."와 함께 `/cart`
- `templates/cart.html` : 취소 버튼 주석 해제

**하는 일**

- **변경 감지** : `@Transactional` 안에서 꺼낸 엔티티는 JPA가 지켜보다가, 커밋할 때 바뀐 값을 `UPDATE`로 자동 반영한다.
- **한 트랜잭션** : `DELETE`와 `UPDATE`가 함께 커밋되거나 함께 롤백된다. "내역은 지워졌는데 인원은 그대로" 같은 상태가 생기지 않는다.
- 없는 신청 번호는 404, 인원은 0 아래로 내려가지 않는다.
- 마감된 모집글에서 한 명이 취소하면 다시 "모집 중"이 된다.

### ② 삭제 정리

**문제** : 신청자가 있는 모집글이나 신청 내역이 있는 회원을 지우면 외래 키 때문에 500 오류가 난다. 글을 지워도 포스터 파일은 `uploads/`에 남는다.

**바꾼 곳**

- `EnrollmentRepository` : `existsByPost(Post)`, `existsByMember(Member)`
- `PostService.delete()` (기존은 주석)
  - 신청 내역이 있으면 `IllegalStateException("신청자가 있는 모집글은 삭제할 수 없습니다.")`
  - DB 삭제가 성공한 **다음에** `fileStore.delete(post.getPosterFile())`
- `BoardController.delete()` (기존은 주석) : 예외를 잡아 `redirect:/board/{id}?deleteError` → 상세 화면에 안내
- `MemberService.deleteMember()` : `existsByMember()` 검사 추가 → "신청 내역이 있는 회원은 삭제할 수 없습니다."

**하는 일**

- DB가 외래 키로 거부하기 **전에** 서비스가 먼저 확인해서 500 대신 안내 메시지를 보여 준다.
- 모집글의 신청 내역은 댓글처럼 cascade로 지우지 않고 **막는다**. 신청한 사람 모르게 신청이 사라지면 안 된다.
- 파일 삭제는 롤백되지 않으므로 DB 삭제가 성공한 뒤에 지운다.

**결과 확인**

| 하는 일                    | 결과                                                     |
| -------------------------- | -------------------------------------------------------- |
| 본인 신청 취소             | "신청이 취소되었습니다.", 인원 - 1                       |
| 남의 신청 번호로 취소      | 403 (인원 그대로)                                        |
| 없는 신청 번호로 취소      | 404                                                      |
| 마감된 모집글을 취소       | 다시 모집 중                                             |
| 신청자 있는 모집글 삭제    | 상세 화면에 "신청자가 있는 모집글은 삭제할 수 없습니다." |
| 신청자 없는 포스터 글 삭제 | 글 + `uploads/`의 포스터 파일 삭제                       |
| 신청 내역 있는 회원 삭제   | 관리자 화면 안내 메시지, API 400                         |

---

## 12주차 - WebSocket 실시간 알림

### ① 신청 취소도 실시간

**문제** : 11주차 신청 취소는 DB만 바꾸고 실시간 메시지를 보내지 않았다. 열어 둔 화면의 남은 자리가 그대로였고, 모집글 쓴 사람도 취소를 알 수 없었다.

**바꾼 곳** : `EnrollmentService.cancel()` 끝부분에 추가

```java
eventPublisher.publishEvent(SeatMessage.from(post)); // 남은 자리가 다시 늘어난다
String writer = post.getAuthor().getUsername();
if (!writer.equals(username)) { // 내 글의 신청을 내가 취소하면 생략
    eventPublisher.publishEvent(new Notification(writer,
            enrollment.getMember().getName() + "님이 '" + post.getTitle() + "' 신청을 취소했습니다. (" ... ")",
            post.getId()));
}
```

**하는 일**

- `cancel()`은 이미 `@Transactional`이라 이벤트만 던지면 된다. 커밋이 성공하면 `RealtimeNotifier`가 보낸다. (롤백되면 보내지 않음)
- `SeatMessage` → `/topic/seats` : 목록 · 상세 · 바구니의 남은 자리와 배지가 바로 바뀐다. (마감 → 모집 중)
- `Notification` → 모집글 쓴 사람에게만 "OO님이 '…' 신청을 취소했습니다."

### ② 댓글 알림

**문제** : 내 글에 댓글이 달려도 알 수 없었다. 그런데 이벤트만 던지면 알림이 오지 않는다. 10주차 `CommentService.write()`에 `@Transactional`이 없어서, 커밋 뒤에 실행되는 `@TransactionalEventListener`가 움직이지 않기 때문이다.

**바꾼 곳** : `CommentService` (기존 `write()`는 주석)

- `ApplicationEventPublisher eventPublisher` 필드와 import 3줄 추가
- `write()`에 `@Transactional` 추가
- 글쓴이와 댓글 쓴 사람이 다르면 `Notification` 발행 : "OO님이 '…' 에 댓글을 남겼습니다."
- 내 글에 내 댓글은 알림 없음

화면(`realtime.js`, `detail.html`, `list.html`, `cart.html`)은 12주차 수업 코드가 이미 처리하므로 고치지 않았다.

**결과 확인** (admin으로 `/topic/seats`, `/user/queue/notifications` 구독, 임시 회원·모집글로 확인 후 삭제)

| 하는 일                    | 결과                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| 김학생이 신청 확정         | 남은 자리 0 (마감) + admin에게 신청 알림                                                 |
| 김학생이 신청 취소         | 남은 자리 1, 상세 화면 마감 → 모집 중, admin에게 "김학생님이 '…' 신청을 취소했습니다. (0/1)" |
| 김학생이 admin 글에 댓글   | admin에게 "김학생님이 '…' 에 댓글을 남겼습니다."                                         |
| admin이 자기 글에 댓글     | 알림 없음                                                                                |

> 참고 : 취소로 자리가 생겨도, 이미 열려 있던 상세 화면의 "신청 바구니에 담기" 버튼은 새로고침해야 나타난다. (표시만 실시간으로 바뀜)

---

## 반응형 웹

휴대폰(약 375px)에서도 보기 좋게 화면별로 나눠서 진행한다. 기존 코드는 주석으로 남기고 `[반응형 N단계]` 표시를 붙였다. PC 화면(768px 이상)은 바뀌지 않는다.

| 단계 | 화면 | 상태 |
| ---- | ---- | ---- |
| 1 | 게시판 목록 | 완료 |
| 2 | 게시글 상세 · 글쓰기 · 댓글 | 완료 |
| 3 | 신청 바구니 | 완료 |
| 4 | 메인 화면 메뉴 | 완료 |
| 5 | 관리자 화면 · `/testdb` | 완료 |
| 6 | 로그인 · 회원가입 · 마이페이지 · 에러 · hello | 완료 |

### 1단계 - 게시판 목록

**문제** : 휴대폰에서 목록 표 5칸(번호·제목·작성자·작성일·조회)이 그대로 나와 제목 칸이 매우 좁았다. 검색창(범위 선택 + 입력 + 버튼)이 카드 밖으로 27px 넘쳐 가로 스크롤이 생겼다.

**바꾼 곳**

- `templates/board/list.html` (기존 줄은 주석)
  - 머리 부분 버튼 묶음에 `flex-wrap` : 버튼이 많으면 다음 줄로
  - 검색 · 글쓰기 묶음에 `board-list-tools`, 목록 표에 `board-list` 클래스 추가
  - 검색 버튼 : 576px 미만에서는 돋보기 아이콘만 (`<span class="d-none d-sm-inline">검색</span>`)
- `static/css/board.css` 맨 아래에 `@media (max-width: 767.98px)` 규칙 추가

**하는 일** (768px 미만에서만)

- 목록 표 → 한 글 = 한 칸 : 표 머리글과 번호를 숨기고, 제목은 한 줄 전체, 작성자 · 작성일 · "조회 N"은 그 아래 작은 글씨
  - `tr`을 `display: flex; flex-wrap: wrap`으로 바꾸고, 제목 칸(`td:nth-child(2)`)만 `flex: 1 1 100%`
  - 숫자만 있으면 뜻을 알 수 없어서 조회 칸 앞에 `::before { content: "조회 " }`
  - 머리글을 숨기면 남는 Bootstrap 굵은 선(`.table>:not(:first-child)`)도 없앤다
- 검색창 : 범위 선택은 110px 고정, 입력칸이 남는 공간을 채우고(`flex: 1 1 0; min-width: 0`), 버튼은 줄어들지 않는다
- 머리 부분 여백 · 제목 크기 · 카드 안쪽 여백 · 페이지 번호 버튼을 조금 줄였다
- 테마의 `h1 { letter-spacing: -3px }` 때문에 작은 제목에서 "내가 쓴 글"이 "내가쓴글"처럼 붙어 보여서 `-1px`로 완화

**결과 확인** (헤드리스 크롬으로 화면 폭을 바꿔 가며 캡처)

| 화면 폭 | 결과 |
| ------- | ---- |
| 320 · 375 · 414px | 가로 스크롤 없음, 제목 + 정보 줄 형태 |
| 375px 내가 쓴 글 · 검색 결과 없음 | 같은 형태, "검색 결과가 없습니다." 가운데 |
| 1280px (PC) | 기존 표 그대로 |

### 2단계 - 게시글 상세 · 글쓰기 · 댓글

**점검 결과** : 1단계에서 넣은 머리 부분 · 카드 여백 규칙이 `board.css`를 쓰는 모든 게시판 화면에 함께 적용되어, 상세 · 글쓰기 · 수정 · 댓글은 가로 스크롤 없이 이미 들어맞았다. 휴대폰에서 어색한 부분만 고쳤다.

**문제**

- 상세 제목이 테마 `h3` 크기 그대로라 휴대폰에서 두세 줄을 차지했다.
- 본문 최소 높이 160px 때문에 짧은 글 아래에 빈 공간이 크게 남았다.
- 포스터가 180px 고정이라 모집 정보와 나란히 놓이지 못하고 왼쪽에 작게 떠 있었다.
- 실시간 알림 상자가 오른쪽에서 20px, 최대 360px로 고정되어 있었다.

**바꾼 곳** : `static/css/board.css` 맨 아래에 `[반응형 2단계]` `@media (max-width: 767.98px)` 규칙 추가 (HTML은 바꾸지 않음)

- 상세 제목 `1.35rem`, 본문 최소 높이 `80px`
- 모집 상자 : 포스터 `width: 100%` (최대 높이 280px)로 위에, 신청 바구니에 담기 버튼도 전체 너비
- 실시간 알림 : 화면 양옆 12px에 붙이고 최대 너비 제한을 풀었다

**결과 확인** (375px, 확인용 포스터 모집글을 직접 만들어 캡처한 뒤 삭제)

| 화면 | 결과 |
| ---- | ---- |
| 모집글 상세 (포스터 있음) | 포스터가 카드 너비로 위에, 정보 · 담기 버튼이 아래 |
| 모집글 상세 (포스터 없음) · 일반 글 | 제목 한두 줄, 본문 아래 빈 공간 줄어듦 |
| 긴 댓글 | 10주차 수정대로 카드 안에서 줄바꿈 |
| 글쓰기 · 수정 | 입력칸 · 모집 설정 · 버튼 모두 카드 안 |
| 1280px (PC) 상세 | 포스터 왼쪽 · 정보 오른쪽, 기존 그대로 |

### 3단계 - 신청 바구니

**문제** : 바구니 화면의 표 두 개(담은 모집글 5칸, 내 신청 내역 4칸)가 휴대폰에서 그대로 나와 제목 칸이 좁고 옆으로 밀렸다. 머리 부분도 줄바꿈이 되지 않았다.

**바꾼 곳**

- `templates/cart.html` (기존 줄은 주석)
  - 머리 부분 묶음에 `flex-wrap` (게시판 목록과 같게)
  - 담은 모집글 표에 `cart-list`, 내 신청 내역 표에 `enroll-list` 클래스 추가
- `static/css/board.css` 맨 아래에 `[반응형 3단계]` 규칙 추가

**하는 일** (768px 미만에서만, 1단계와 같은 방식 + CSS Grid로 칸 배치)

| 표 | 휴대폰 배치 |
| -- | ----------- |
| 담은 모집글 | 왼쪽 포스터(두 줄 높이) · 가운데 제목 / "정원 5명 · 남은 자리 5" · 오른쪽 빼기 |
| 내 신청 내역 | 제목 한 줄 · 그 아래 "신청 1 / 5 · 신청 시간" · 오른쪽 취소 |

- `tr`을 `display: grid`로 바꾸고 `grid-column` · `grid-row`로 칸마다 자리를 정했다.
- 숫자만 남는 칸에는 `::before`로 "정원 ", "남은 자리 ", "신청 "을 붙였다.
- 비어 있을 때 안내 줄(`colspan`)은 한 칸 전체 가운데, "모두 신청 확정" 버튼은 전체 너비
- 12주차 실시간 갱신(`data-seat-post`)은 그대로 동작한다. HTML 구조는 바꾸지 않고 CSS로 배치만 바꿨기 때문이다.

**결과 확인** (확인용 모집글 2개를 직접 만들어 하나는 신청 확정, 하나는 바구니에 담아 캡처한 뒤 취소 · 빼기 · 삭제)

| 화면 | 결과 |
| ---- | ---- |
| 375px · 320px | 가로 스크롤 없음, 긴 제목도 줄바꿈 |
| 375px 빈 바구니 | "바구니가 비어 있습니다" 가운데 |
| 1280px (PC) | 기존 표 그대로 |

### 4단계 - 메인 화면 메뉴

**문제** (992px 미만 = 햄버거 메뉴가 나오는 크기)

| 증상 | 원인 |
| ---- | ---- |
| 메뉴를 펼치면 "안녕하세요, 여러분!" 말풍선이 메뉴 글자 위를 덮음 | 테마의 첫 화면 제목 · 사진은 `z-index: 22`, 메뉴(`.navbar`)는 `z-index: 9` |
| 휴대폰 메뉴에 로그인 아이디 · 권한 배지 · 회원가입이 없음 | 이 부분이 PC 전용 영역(`d-none d-lg-flex`)에만 있었다 |
| 소개 · 기술 같은 메뉴를 눌러도 메뉴가 열린 채로 화면을 가림 | 같은 페이지 안 이동이라 페이지가 다시 열리지 않는다 |
| 320px에서 가로 스크롤 (5px) | ① 회사 로고 : 테마 `max-width: 100px`가 `img-fluid`(100%)를 덮어써서 82px 칸보다 커짐 ② 소개 숫자(`245`)가 반 칸보다 큼 |

**바꾼 곳** : `templates/index.html` (기존 코드는 그대로 두고 추가)

- `<style>` 끝에 `[반응형 4단계]` 규칙
  - 992px 미만 : `.navbar { z-index: 30 }`, 메뉴가 길면 메뉴 안에서 스크롤
  - `.clients-image { max-width: min(100px, 100%) }` : 100px 또는 칸 너비 중 작은 값
  - 400px 이하 : `.featured-numbers { font-size: 40px }`
- 메뉴 목록 맨 끝에 휴대폰 전용(`d-lg-none`) 항목 2개
  - 로그인했을 때 : "admin님 + 권한 배지" (PC 오른쪽과 같은 `sec:authorize="hasRole(...)"`)
  - 로그인 안 했을 때 : "회원가입" 링크
  - 맨 끝에 둔 이유 : `click-scroll.js`가 앞의 메뉴 5개를 순서(`eq(index)`)로 찾기 때문에 중간에 끼우면 스크롤 위치 표시가 어긋난다
- `</body>` 앞에 스크립트 : 메뉴가 열려 있을 때 메뉴 링크를 누르면 `bootstrap.Collapse`로 닫는다

**결과 확인** (헤드리스 크롬)

| 화면 | 결과 |
| ---- | ---- |
| 320 · 360 · 375 · 414 · 768px | 가로 스크롤 없음 |
| 375px 메뉴 펼침 (로그인) | 메뉴가 첫 화면 위에, 맨 아래 "admin님 ADMIN" |
| 375px 메뉴 펼침 (로그인 안 함) | 맨 아래 "회원가입" |
| 메뉴에서 "소개" 누름 | 메뉴가 닫히고 소개로 이동 |
| 1280px (PC) | 기존 메뉴 그대로 |

> 참고 : 첫 화면과 소개의 동그란 프로필 사진(`/images/profile.jpg`)은 파일이 없어 404다. PC에서도 마찬가지이며, 반응형과는 별개라 그대로 두었다.

### 5단계 - 관리자 화면 · `/testdb`

**문제**

- 회원 관리(`/admin/members`, `/admin/members-api`) : 회원 표 6칸이 휴대폰에서 그대로 나와 이름이 한 글자씩 세로로 끊겼고, "권한 변경 · 삭제" 칸은 표 안에서 오른쪽으로 밀려 보이지 않았다. 통계 카드 3개가 세로로 쌓여 첫 화면을 다 차지했다.
- `/testdb` : 4주차의 기본 HTML이라 화면 크기 설정(`viewport`)이 없었다. 휴대폰은 이런 페이지를 980px 화면으로 그린 뒤 통째로 축소하므로 글자가 아주 작게 보였다.

**바꾼 곳**

- `static/css/admin.css` (새 파일) : 두 관리자 화면 공통 휴대폰 규칙
  - 두 화면은 각자 `<style>`을 갖고 있어서, 이 파일은 그 `<style>` **뒤에** 연결했다 (같은 우선순위면 뒤에 온 규칙이 이긴다)
- `admin/members.html`, `admin/members-api.html` (기존 줄은 주석) : `admin.css` 연결, 회원 표에 `member-list`, 통계 줄에 `stat-row` 클래스 추가
- `testdb.html` (기존 줄은 주석) : `viewport` · 부트스트랩 연결, `container` 안에 부트스트랩 표(`table-responsive`), "메인으로" 버튼

**하는 일** (768px 미만에서만)

- 회원 표 → 회원 1명 = 1칸 (CSS Grid)
  - 첫 줄 : 아이디(+ "나") · 이름 · 오른쪽 권한 배지
  - 둘째 줄 : 권한 선택 + 변경 버튼 · 오른쪽 삭제 버튼
  - API 화면은 JavaScript가 같은 순서의 `<td>`를 그리므로 같은 규칙이 그대로 적용된다
- 통계 카드 3개는 한 줄에 3칸, 아이콘 위 · 숫자 아래로 작게
- API 화면의 요청 · 응답 기록 상자 높이 520px → 320px
- 머리 부분 · 카드 여백은 게시판과 같게

**결과 확인**

| 화면 | 결과 |
| ---- | ---- |
| 375 · 320px 회원 관리 | 가로 스크롤 없음, 권한 변경 · 삭제 버튼까지 모두 보임 |
| 375px 회원 관리 (API) | 같은 형태, JavaScript로 다시 그린 목록도 같음 |
| 375px `/testdb` | 화면 너비에 맞는 표, 글자 크기 정상 |
| 1280px (PC) 두 관리자 화면 | 기존 그대로 |

### 6단계 - 로그인 · 회원가입 · 마이페이지 · 에러 · hello

**점검 결과** : 가운데 카드 하나로 된 화면이라 대부분 이미 들어맞았다. 320px에서 어색한 곳과, 점검 중 발견한 문제 2개를 고쳤다. `hello` · `hello2`는 2주차 기본 HTML이지만 `viewport`가 있어 휴대폰에서도 글자가 화면 폭에 맞게 줄바꿈되므로 그대로 두었다.

**문제**

| 화면 | 증상 |
| ---- | ---- |
| 회원가입 (320px) | 아래 링크가 "메인 / 으로", "로 / 그인"처럼 단어 중간에서 끊김 |
| 내 정보 (320px) | 카드 안쪽 여백(36px)이 커서 "접근 권한 테스트"의 상태 글자가 "로그인 사 / 용자"처럼 끊김 |
| 로그인 · 내 정보 (모든 폭) | 맨 위 동그라미 아이콘이 비어 보임 → 로컬 `bootstrap-icons.css`가 예전 버전이라 `bi-person-lock`, `bi-person-vcard`가 없다 (3주차 AI 아이콘과 같은 원인) |
| 403 · 404 · 413 외의 오류 (405, 500 …) | 공통 에러 화면(`error.html`)이 없어 "Whitelabel Error Page"가 나옴 → `viewport`가 없어 휴대폰에서 아주 작게 보이고, 개발 중(devtools)에는 자바 오류 내용(stack trace)까지 화면에 나왔다 |

**바꾼 곳**

- `static/css/auth.css` (새 파일) : 가운데 카드 화면 공통 휴대폰 규칙 (576px 미만)
  - 카드 바깥 · 안쪽 여백 줄이기 (`40px 36px` → `28px 20px`)
  - 아래 링크 줄 : `flex-wrap` + 링크마다 `white-space: nowrap` → 단어 중간이 아니라 링크 통째로 다음 줄
  - 접근 권한 테스트 : 한 줄에 안 들어가면 상태를 다음 줄 오른쪽(`margin-left: auto`)으로
- `login.html`, `signup.html`, `mypage.html`, `error/403.html`, `error/404.html`, `error/413.html` : 각자의 `<style>` **뒤에** `auth.css` 연결
- `login.html`, `mypage.html` : 최신 아이콘 CDN(`bootstrap-icons@1.13.1`) 추가
- `templates/error.html` (새 파일) : 공통 에러 화면. `error/404.html`과 같은 모양으로 상태 코드(`${status}`) · 오류 이름(`${error}`) · 요청 주소(`${path}`)만 보여 준다 (`trace`는 일부러 보여 주지 않음)
  - 스프링 부트는 서버가 **시작될 때** 에러 화면 파일이 있는지 확인하므로, 이 파일은 서버를 다시 시작해야 적용된다

**결과 확인** (320px)

| 화면 | 결과 |
| ---- | ---- |
| 로그인 | 아이콘 표시, 가로 스크롤 없음 |
| 회원가입 | 아래 링크가 두 줄로 깔끔하게 나뉨 |
| 내 정보 | 아이콘 표시, 상태가 다음 줄 오른쪽 |
| GET `/cart/enrollments/…/cancel` (405) | 새 에러 화면, stack trace 없음 |
| 없는 글 (404) · 관리자 API 404 | 기존 그대로 |

---

## 게시판 개선 - 처음 · 끝 페이지 버튼

**문제** : 페이지 번호는 현재 페이지 ±2만 보여서, 11페이지짜리 목록의 1페이지에서 마지막 페이지로 가려면 "다음"이나 번호를 여러 번 눌러야 했다.

**바꾼 곳**

- `board/list.html` 페이지 번호 줄 (기존 줄은 주석)
  - 맨 앞 "« 처음" : `page=0`, 맨 뒤 "끝 »" : `page=${page.totalPages - 1}` (page는 0부터 세므로 -1)
  - 이미 첫 / 끝 페이지면 `disabled` (기존 이전 · 다음과 같은 `page.first` · `page.last` 사용)
  - 링크에 기존처럼 `keyword` · `type`을 붙이고 `pageUrl`을 써서, 검색 결과와 "내가 쓴 글"에서도 그 목록 안에서 처음 / 끝으로 간다
- 휴대폰(576px 미만)에서 버튼이 9개가 되어 320px 화면을 31px 넘쳤다 → 한 줄에 들어가게 조정
  - 처음 · 이전 · 다음 · 끝은 아이콘만 (`« ‹ › »`), PC에서는 글자도 표시
  - 현재 페이지에서 2칸 떨어진 번호에 `page-far` 클래스를 붙이고 `board.css`에서 휴대폰일 때만 숨김 → 현재 ±1만
  - 버튼 간격 · 너비를 조금 줄임

**결과 확인**

| 목록 | "처음" 링크 | "끝" 링크 |
| ---- | ----------- | --------- |
| `/board` 1페이지 | 비활성 | `/board?page=10` |
| `/board?page=10` (마지막) | `/board?page=0` | 비활성 |
| 작성자 "관리" 검색 4페이지 | `…page=0&keyword=관리&type=writer` | `…page=10&keyword=관리&type=writer` |
| `/board/my?page=2` | `/board/my?page=0` | `/board/my?page=10` |

| 화면 폭 | 모양 |
| ------- | ---- |
| 1280px | « 처음 · 이전 · 4 5 **6** 7 8 · 다음 · 끝 » |
| 320 · 375px | « ‹ 5 **6** 7 › » (가로 스크롤 없음) |

---

## 디자인 개편 (라이트 · 다크 모드)

참고 디자인(포인트샵 화면)의 분위기만 가져오고, 화면 구성과 기능은 그대로 둔다. 기존 CSS는 고치지 않고 새 테마 파일을 **뒤에** 연결해서 덮어쓴다.

| 단계 | 화면 | 상태 |
| ---- | ---- | ---- |
| 1 | 공통 테마 + 게시판 목록 · 상세 · 글쓰기 | 완료 |
| 2 | 신청 바구니 · 관리자 화면 | 예정 |
| 3 | 로그인 · 회원가입 · 내 정보 · 에러 · `/testdb` | 예정 |
| 4 | 메인 포트폴리오(`index.html`) | 예정 |

### 1단계 - 공통 테마 + 게시판

**참고 디자인에서 가져온 것**

| 요소 | 적용 |
| ---- | ---- |
| 어두운 배경 + 조금 밝은 둥근 카드 + 얇은 테두리 | `--hz-bg`, `--hz-surface`, `--hz-border`, 카드 모서리 18px |
| 민트 → 보라 그라데이션 | 머리 부분 제목 글자, 주 버튼(글쓰기 · 등록 · 담기), 현재 페이지 번호, 진행 막대 |
| 알약 모양 버튼 · 입력칸 | `border-radius: 999px` |
| 은은한 빛이 번진 배너 | 머리 부분 배경 (`radial-gradient` 2개) |
| 회색 보조 글자 | 작성자 · 날짜 · 조회 등 `--hz-muted` |

**새 파일**

- `static/css/theme.css`
  - 색은 모두 변수(`--hz-...`)로 정하고, `:root[data-theme="light"]` / `:root[data-theme="dark"]`에서 값만 바꾼다. 아래 규칙들은 변수만 쓰므로 한 번만 쓰면 두 모드에 다 적용된다.
  - 템플릿 변수(`--primary-color`, `--secondary-color`, `--p-color`)도 새 보라 · 민트 · 회색으로 바꿔서, 기존 CSS가 이 변수를 쓰는 곳도 함께 바뀐다.
  - 한글 글꼴 Pretendard (CDN)
  - 다크 모드에서 안 보이는 부트스트랩 기본값 보정 : 선택 상자 화살표, `.text-muted`, `.text-primary`(파란색 → 민트), 알림 상자, 반응형 단계의 고정 구분선 색(`#edf0f5`)
- `static/js/theme.js`
  - `<head>`에서 바로 실행해 화면이 그려지기 **전에** `data-theme`을 붙인다 (하얀 화면이 번쩍이지 않게).
  - 고른 모드는 `localStorage`에 기억하고, 고른 적이 없으면 컴퓨터 · 휴대폰 설정(`prefers-color-scheme`)을 따른다.
  - 화면 왼쪽 아래에 모드 바꾸기 버튼(달 / 해)을 넣는다. HTML마다 버튼을 넣지 않아도 되도록 스크립트가 만든다.

**바꾼 곳** : `board/list.html`, `board/detail.html`, `board/form.html`의 `board.css` 바로 아래에 `theme.css` · `theme.js` 연결 (3줄)

**결과 확인** (헤드리스 크롬, 1280px · 375px, 두 모드)

| 화면 | 결과 |
| ---- | ---- |
| 목록 | 다크 : 검은 배경 · 어두운 카드 · 그라데이션 제목 / 라이트 : 연한 회색 배경 · 흰 카드 |
| 상세 (모집글) | 모집 상자 · 진행 막대 · 담기 버튼 그라데이션, 남은 자리 숫자 민트 |
| 글쓰기 | 입력칸 · 모집 설정 상자가 모드 색을 따름 |
| 휴대폰 목록 | 반응형 배치 그대로, 구분선이 모드 색 |

---

## 작업 기록

### 11주차 - 이름이 겹치는 게시판 화면 합치기

11주차 제공 화면으로 덮어쓰면서, 9·10주차에 직접 추가한 부분이 사본(`_11`, `9`)에만 남아 있었다.

| 사본                             | 원본에 없던 부분                                         | 처리               |
| -------------------------------- | -------------------------------------------------------- | ------------------ |
| `list_11.html`                   | 9주차 개선 ① 버튼 전환, 9주차 개선 ② `pageshow` 스크립트 | `list.html`로 옮김 |
| `list9.html`                     | 없음 (`list_11.html`에 모두 포함)                        | -                  |
| `detail_11.html`, `form_11.html` | 없음 (원본이 상위 버전)                                  | -                  |

합친 뒤 사본 4개는 삭제했다. (이전 내용은 git 기록에 남아 있음)

### 12주차 pull 후 - 11주차 연습문제 다시 합치기

**상황** : 11주차 연습문제를 푸시하지 못한 채 다른 PC에서 12주차를 작업해 푸시했다. 다른 PC에는 취소 버튼만 있고 처리 코드가 없어서 취소가 동작하지 않았다. (`12주차 - 수강취소 오류있음`)

**한 일**

- 11주차 작업을 stash → 12주차 pull → 다시 합침
  - 자바 코드는 충돌 없이 합쳐졌다. `EnrollmentService`에 12주차 이벤트 코드와 11주차 `cancel()`이 함께 있다.
  - `board/list.html` : 12주차 실시간 스크립트 아래에 9주차 `pageshow` 스크립트를 이어 붙였다.
  - `cart.html` : 다른 PC 버전 사용
- 12주차에 생긴 사본도 원본과 비교해 합쳤다.

| 사본                                       | 원본에 없던 부분                                     | 처리                                 |
| ------------------------------------------ | ---------------------------------------------------- | ------------------------------------ |
| `cart12.html`                              | 남은 자리 칸의 `data-seat-post` (실시간 갱신)        | `cart.html`로 옮김 (기존 줄은 주석) |
| `board/list전.html`, `board/detail전.html` | 없음 (12주차 원본이 실시간 버전으로 포함)            | -                                    |
| `static/css/board전.css`                   | 없음                                                 | -                                    |

합친 뒤 사본 4개는 삭제했다.

---

## 문제 해결 기록

| 증상                                                           | 원인 → 해결                                                                                                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 서버 실행 시 `Access denied for user ... (using password: NO)` | DB 계정 파일 `application-secret.properties`가 `.gitignore`라 다른 PC에 없었다. `optional:`로 불러와서 오류 없이 넘어가고 계정 없이 접속하다 실패 → 파일을 다시 만듦 |
| AI 아이콘이 화면에 안 나옴                                     | 로컬 `bootstrap-icons.css`가 예전 버전 → 최신 CDN 링크 추가                                                                                                         |
| curl로 테스트하면 로그인 화면(302) 대신 401                    | 7주차 `httpBasic()` 때문에 브라우저가 아닌 요청에는 401. 브라우저는 그대로 로그인 화면                                                                              |
| 권한을 바꿨는데 메뉴가 그대로                                  | 권한은 로그인할 때 세션에 복사된다 → 다시 로그인해야 반영                                                                                                           |
| 뒤로가기 하면 목록 조회수가 예전 값                            | 브라우저 bfcache → `pageshow` + `event.persisted`일 때 새로고침 (9주차 개선 ②)                                                                                      |
| 긴 댓글이 카드 밖으로 넘침                                     | 공백 없는 글자는 줄바꿈 안 됨 → `overflow-wrap: anywhere` (10주차 개선)                                                                                             |
| 댓글 알림 이벤트를 던졌는데 알림이 안 옴                       | `@TransactionalEventListener`는 트랜잭션이 있어야 실행 → `write()`에 `@Transactional` (12주차 ②)                                                                    |
