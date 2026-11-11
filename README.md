# 자바웹프로그래밍(2) - 포트폴리오 프로젝트

Spring Boot 4.1 · Java 25 · Thymeleaf · Spring Data JPA · MySQL · Spring Security

## 진행 현황

- 2주차 : 스프링 부트 개발환경, URL 매핑과 컨트롤러 완료
- 3주차 : 포트폴리오(부트스트랩 5) 화면 및 기술 상세 페이지 완료
- 4주차 : MySQL 데이터베이스 연동(JPA) 완료
- 5주차 : 로그인/로그아웃, 비밀번호 암호화(BCrypt) 완료
- 6주차 : 권한(ROLE) 접근 제어, 관리자 페이지 분리 완료
- 7주차 : 회원 관리 REST API(JSON) 완료

아래는 각 주차의 **연습문제를 어떻게 해결했는지** 정리한 내용입니다.
기존 코드는 지우지 않고, 바꿔야 하는 부분은 주석으로 남긴 뒤 `[N주차 연습문제]` 표시를 붙여 새 코드를 추가했습니다.

---

## 2주차 - URL 매핑과 컨트롤러 추가하기

**문제** : `/hello2` 페이지를 만들고 컨트롤러에서 5개의 값을 넘겨 화면에 출력한다.

**해결 방법**

- `DemoController`의 `hello2()` 메서드에서 `model.addAttribute()`로 `data1` ~ `data5` 다섯 개의 값을 담았다.
- `hello2.html`에서 `th:text="${data1}"` 형태로 다섯 값을 출력했다.
- `hello.html`의 링크 이름을 "두번째 헬로 페이지"로 바꾸고 주소는 `/hello2`로 통일했다.

**이유**

- 화면(HTML)에 직접 글자를 쓰지 않고 **컨트롤러 → Model → 뷰** 순서로 데이터를 넘겨야 나중에 DB 값으로 바꾸기 쉽다.
- 링크를 `/hello2.html`이 아니라 `/hello2`로 쓴 이유는 templates 폴더의 파일은 직접 열 수 없고, 반드시 컨트롤러의 URL 매핑을 거쳐야 하기 때문이다. (2주차 404 오류의 원인)

---

## 3주차 - 포트폴리오 수정하기

**문제** : 기술(Services) 영역 4가지의 아이콘을 수정하고, 웹을 제외한 나머지 기술의 상세 페이지를 만든다.

**해결 방법**

- `detailed_web.html`의 디자인을 그대로 재활용해서 `detailed_ai.html`, `detailed_security.html`, `detailed_game.html`을 `resources/public` 폴더에 만들었다. 각 페이지의 제목, 소개글, 기술 스택, 숙련도, 진행 방식만 분야에 맞게 바꿨다.
- `index.html`의 비어 있던 `Discover More` 링크(`href="#"`)를 각 상세 페이지로 연결했다.
- 분야와 맞지 않던 아이콘을 바꿨다. 보안 `bi-phone` → `bi-shield-lock`, 게임 `bi-google` → `bi-controller`
- AI 아이콘(`bi-anthropic`)이 화면에 나오지 않는 문제가 있었다. 프로젝트에 들어 있는 `bootstrap-icons.css`가 예전 버전이라 이 아이콘이 없었기 때문이다. 최신 아이콘 CDN 링크를 추가해서 해결했다.
- `SecurityConfig`에 세 상세 페이지를 `permitAll()`로 추가했다. (5주차부터는 허용하지 않은 주소가 모두 잠기므로 필요)

**이유**

- 상세 페이지는 데이터 없이 보여주기만 하는 소개 페이지이므로, 컨트롤러 없이 바로 열리는 `public` 폴더에 두는 것이 간단하다.
- 새 탭으로 여는 링크에는 `rel="noopener noreferrer"`를 붙여, 새로 열린 페이지가 원래 페이지를 조작하지 못하게 했다.

---

## 4주차 - 사용자 정보 수정 및 출력하기

**문제** : TestDB 엔티티에 나이·성별 컬럼을 추가하고, 여러 사용자를 표로 출력한다.

**해결 방법**

- `TestDB` 엔티티에 `Integer age`, `String gender` 필드를 추가했다.
- `TestService`에 `findAll()`을 추가하고, `DemoController`에서 `users`라는 이름으로 전체 목록을 화면에 넘겼다.
- `testdb.html`은 1명만 출력하던 코드를 주석 처리하고, `th:each="user : ${users}"`로 표의 행을 반복 출력했다.
- 데이터는 `testdb_update.sql`의 INSERT 문으로 넣는다.

**이유**

- `application.properties`의 `spring.jpa.hibernate.ddl-auto=update` 설정 덕분에 엔티티에 필드만 추가하면 서버 재시작 시 테이블에 컬럼이 자동으로 생긴다. SQL로 테이블을 직접 고치지 않아도 된다.
- 나이를 `int`가 아닌 `Integer`로 쓴 이유 : 기존에 저장된 행은 나이 값이 비어 있다(null). 기본형 `int`는 null을 담을 수 없어서 오류가 나기 때문이다.
- `findAll()`은 JpaRepository가 기본으로 제공하므로 SQL을 직접 쓰지 않아도 된다.

---

## 5주차 - 로그인 기능 개선하기

### ① 로그인 상태 유지 (remember-me)

**해결 방법**

- `SecurityConfig`의 로그아웃 설정 뒤에 `.rememberMe()`를 추가했다.
- `key("비밀키")`로 쿠키 위조를 막고, `tokenValiditySeconds(60 * 60 * 24 * 7)`로 7일 동안 유지되게 했다.

**이유**

- 일반 로그인은 세션 쿠키(JSESSIONID)를 쓰기 때문에 브라우저를 닫으면 로그인이 풀린다. remember-me는 별도의 쿠키를 남겨서 다시 접속해도 자동으로 로그인된다.
- `login.html`의 체크박스 이름이 `remember-me`라서 시큐리티가 자동으로 인식한다.
- 로그아웃할 때는 기존 설정의 `deleteCookies("JSESSIONID", "remember-me")`가 이 쿠키도 함께 지운다.

### ② 비밀번호 확인 검증

**해결 방법**

- `MemberService.signup()`에서 `password`와 `passwordConfirm`이 다르면 `IllegalArgumentException("비밀번호가 일치하지 않습니다.")`을 던지게 했다.
- 컨트롤러는 이미 이 예외를 잡아 가입 화면에 오류 메시지를 보여주도록 되어 있어서, 서비스만 고치면 됐다.

**이유**

- 검사를 화면(HTML)이 아닌 **서비스**에 둔 이유 : 화면 검사는 개발자 도구로 쉽게 우회할 수 있다. 또 7주차의 회원 등록 API(Postman)도 같은 `signup()`을 쓰므로, 한 곳에서 검사하면 화면과 API 모두 막힌다.
- 예외가 발생하면 `save()` 전에 멈추므로 DB에 저장되지 않는다.

---

## 6주차 - 권한 관리 개선하기

### ① 관리자 본인 보호

**해결 방법**

- `MemberService`에 `checkNotSelf()` 메서드를 만들었다. `SecurityContextHolder`로 현재 로그인한 아이디를 꺼내서, 변경·삭제 대상과 같으면 예외를 던진다.
- `changeRole()`, `deleteMember()`에서 이 메서드를 호출한다. 메시지 : "자기 자신의 권한 변경·삭제는 할 수 없습니다."

**이유**

- 관리자가 실수로 자기 자신을 USER로 바꾸거나 삭제하면 관리자가 0명이 되어 아무도 회원 관리를 할 수 없게 된다.
- `SecurityContextHolder`를 쓴 이유 : 컨트롤러는 `Principal`을 파라미터로 받을 수 있지만, 서비스에서는 그럴 수 없다. `SecurityContextHolder`는 어디서든 로그인 사용자를 꺼낼 수 있다.
- 검사를 서비스에 두었기 때문에 관리자 화면(6주차)과 REST API(7주차) 모두 같은 규칙이 적용된다.

### ② 매니저(MANAGER) 권한 추가

**해결 방법**

- 허용 권한 목록(화이트리스트) `ROLES`에 `"MANAGER"`를 추가했다. (기존 줄은 주석으로 남김)
- `SecurityConfig`에 `.requestMatchers("/testdb").hasAnyRole("ADMIN", "MANAGER")`를 추가해서 USER는 회원목록에 들어가면 403이 나온다.
- (추가 도전) `index.html`의 회원목록 메뉴에 `sec:authorize="hasAnyRole('ADMIN', 'MANAGER')"`를 붙여 USER에게는 메뉴가 보이지 않게 했다.

**이유**

- `hasRole()`은 권한 하나만 검사하고, `hasAnyRole()`은 여러 권한 중 하나만 있으면 통과한다.
- URL 규칙은 위에서부터 순서대로 검사하므로 `anyRequest()`보다 **위에** 추가했다.
- 메뉴 숨기기(화면)만으로는 주소를 직접 입력하는 것을 막을 수 없다. 그래서 URL 규칙(1차 잠금)도 함께 추가했다.

| 주소        | USER | MANAGER | ADMIN |
| ----------- | ---- | ------- | ----- |
| /mypage     | ✓    | ✓       | ✓     |
| /testdb     | 403  | ✓       | ✓     |
| /admin/\*\* | 403  | 403     | ✓     |

---

## 7주차 - REST API 개선하기

### ① 회원 검색 API

**문제** : `GET /api/admin/members?keyword=student`처럼 아이디나 이름에 검색어가 들어간 회원만 조회한다.

**해결 방법**

- `MemberRepository`에 `findByUsernameContainingOrNameContainingOrderByIdAsc()` 메서드를 추가했다.
- `MemberService`에 `search(keyword)`를 만들었다. 검색어가 비어 있으면 전체 목록, 있으면 검색 결과를 돌려준다.
- `AdminApiController`의 목록 메서드에 `@RequestParam(required = false) String keyword`를 추가했다.

**이유**

- JPA는 메서드 이름 규칙만 지키면 SQL을 대신 만들어 준다.
  - `Containing` → `LIKE '%검색어%'`
  - `Or` → `OR`
  - `OrderByIdAsc` → `ORDER BY id`
- `required = false`로 한 이유 : 검색어 없이 `/api/admin/members`만 호출해도 기존처럼 전체 목록이 나와야 하기 때문이다. (없으면 400 오류)
- 응답은 기존처럼 `MemberResponse`(DTO)로 바꿔서 보내므로 비밀번호는 노출되지 않는다.

### ② 오류 처리 한 곳에 모으기

**문제** : 등록·수정·삭제 메서드마다 같은 `try-catch`가 반복된다.

**해결 방법**

- `ApiExceptionHandler` 클래스를 새로 만들고 `@RestControllerAdvice`를 붙였다.
- `@ExceptionHandler(IllegalArgumentException.class)`로 이 예외가 발생하면 `400 {"error": "메시지"}`를 응답하게 했다.
- `AdminApiController`의 기존 메서드 3개(try-catch 포함)는 주석으로 남기고, try-catch를 뺀 새 메서드를 추가했다.

**이유**

- 같은 오류 처리 코드가 여러 곳에 있으면, 응답 형식을 바꿀 때 모든 곳을 고쳐야 하고 빠뜨리기 쉽다. 한 곳에 모으면 컨트롤러는 정상 흐름만 남아 읽기 쉬워진다.
- `@RestControllerAdvice(annotations = RestController.class)`로 범위를 **API 컨트롤러로만** 제한했다. 화면 컨트롤러(`AdminController`, `MemberController`)는 오류를 화면 메시지로 보여줘야 하는데, 전체에 적용하면 화면 대신 JSON이 나올 수 있기 때문이다.
- 반환 타입을 `ResponseEntity<?>`에서 `ResponseEntity<MemberResponse>`, `ResponseEntity<Void>`로 바꿨다. 이제 성공 응답만 반환하므로 타입을 정확하게 쓸 수 있다.
- 추가로 `application.properties`에 `server.error.include-stacktrace=never`를 넣어 오류 JSON에 서버 내부 정보(trace)가 나가지 않게 했다.

**결과 확인** : try-catch를 지우기 전과 상태 코드·메시지가 똑같이 나오는지 테스트했다.

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

## 문제 해결 기록

| 증상                                                           | 원인 → 해결                                                                                                                                                                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 서버 실행 시 `Access denied for user ... (using password: NO)` | DB 계정 정보를 담은 `application-secret.properties`가 `.gitignore`에 들어 있어서 다른 PC로 가져오면 빠져 있었다. `optional:`로 불러오기 때문에 오류 없이 넘어가고, 계정 없이 접속하다 실패한 것이다. → 파일을 다시 만들어 해결 |
| AI 아이콘이 화면에 안 나옴                                     | 로컬 `bootstrap-icons.css`가 예전 버전 → 최신 CDN 링크 추가                                                                                                                                                                    |
| curl로 테스트하면 로그인 화면(302) 대신 401                    | 7주차에 `httpBasic()`을 켜서, 브라우저가 아닌 요청에는 401을 응답한다. 브라우저에서는 그대로 로그인 화면으로 이동한다.                                                                                                         |
| 권한을 바꿨는데 메뉴가 그대로                                  | 권한은 로그인할 때 세션에 복사된다 → 다시 로그인해야 반영                                                                                                                                                                      |

> 주의 : DB 비밀번호는 `application-secret.properties`에만 두고 GitHub에 올리지 않는다. (5주차)

# 9주차 - 게시판(CRUD) + 수정 및 삭제 / 본인 확인

## 9주차 연습문제 - 게시판 개선하기

### ① 조회수

**추가한 곳**

- `PostService` : `read(id)` 메서드 추가
- `BoardController` : `detail()`에서 `findById()` 대신 `read()`를 호출 (기존 `detail()`은 주석으로 남김)

**하는 일**

- `read(id)`는 `findById()`로 글을 찾은 뒤 `viewCount`를 1 올리고 `save()`로 저장한다. id가 있으므로 `save()`는 UPDATE를 실행한다.
- 상세 화면(`GET /board/{id}`)을 열 때마다 조회수가 1씩 늘어나고, 목록·상세 화면의 "조회" 칸에 그대로 보인다.
- 조회수만 바꾸고 `updatedAt`은 건드리지 않는다. 그래서 글을 읽기만 해도 "수정 시간"이 표시되는 문제가 생기지 않는다.
- 없는 글 번호라면 `findById()`에서 404가 나므로 조회수 증가 전에 멈춘다.

### ② 내가 쓴 글 모아 보기

**추가한 곳**

- `PostRepository` : `findByAuthor_UsernameOrderByIdDesc(String username)` 메서드 이름만 추가
- `PostService` : `findMine(username)` 메서드 추가
- `BoardController` : `GET /board/my` 를 처리하는 `my()` 메서드 추가

**하는 일**

- 리포지토리 메서드는 이름 규칙만으로 JPA가 SQL을 만든다.
  - `findBy` → `SELECT ... FROM posts`
  - `Author_Username` → 작성자(author)의 username으로 `JOIN member ... WHERE m.username = ?`
  - `OrderByIdDesc` → `ORDER BY p.id DESC` (최신 글이 위로)
- `my()`는 `Principal`에서 로그인한 아이디를 꺼내 그 사람의 글만 조회하고, `posts`와 `listTitle = "내가 쓴 글"`을 넘겨 기존 `board/list.html`을 그대로 재사용한다. (`listTitle`이 없으면 화면은 "게시판"으로 표시)
- `SecurityConfig`의 `permitAll()`은 `/board`와 `/board/{id:\d+}`(숫자)만 허용하므로, `/board/my`는 `anyRequest().authenticated()`에 걸려 로그인하지 않으면 로그인 화면으로 이동한다. 설정은 바꿀 필요가 없었다.

**결과 확인**

| 하는 일                           | 기대 결과                               |
| --------------------------------- | --------------------------------------- |
| 같은 글 상세를 3번 열기           | 조회 3                                  |
| student1 로그인 → 내가 쓴 글      | student1의 글만, 제목 "내가 쓴 글"      |
| 로그인 안 하고 `/board/my`        | 로그인 화면                             |

=============================================
---

## 9주차 추가 개선 - 게시판 사용성 문제 해결

### ① "내가 쓴 글"에서 전체 글로 돌아갈 수 없음

**문제** : "내가 쓴 글" 화면에도 버튼이 똑같이 "내가 쓴 글"로 보였다. 전체 글 목록으로 돌아가려면 메인으로 나갔다가 게시판 메뉴를 다시 눌러야 했다.

**바꾼 곳**

- `BoardController.my()` : `model.addAttribute("myList", true);` 한 줄 추가
- `board/list.html` : 헤더의 "내가 쓴 글" 버튼(기존 줄은 주석 처리)을 아래 두 버튼으로 바꿨다.

```html
<a th:unless="${myList}" th:href="@{/board/my}" ...>내가 쓴 글</a>
<a th:if="${myList}" th:href="@{/board}" ...>전체 글 보기</a>
```

**하는 일**

- `myList`는 `/board/my`일 때만 넘어가는 값이다. 그래서 전체 목록(`/board`)에서는 "내가 쓴 글" 버튼이, 내가 쓴 글 화면에서는 "전체 글 보기" 버튼이 보인다.
- `listTitle`(화면 제목)과 별도로 `myList`를 둔 이유 : 제목 문구와 화면 종류를 따로 관리해야, 나중에 제목만 바꿔도 버튼 동작이 함께 바뀌지 않는다.

### ② 뒤로가기 시 목록의 조회수가 바로 바뀌지 않음

**문제** : 목록 → 글 상세(조회수 +1) → 브라우저 뒤로가기를 누르면, 목록에는 이전 조회수가 그대로 보였다. 새로고침해야 반영됐다.

**원인** : 서버는 이미 `Cache-Control: no-cache, no-store`를 보내고 있었다(스프링 시큐리티 기본값). 그래서 HTTP 캐시 문제는 아니었다. 브라우저의 **뒤로/앞으로 캐시(bfcache)** 가 서버에 다시 요청하지 않고, 떠나기 전 화면을 메모리에서 그대로 복원했기 때문이다.

**바꾼 곳**

- `board/list.html` : `</body>` 바로 앞에 `pageshow` 이벤트 스크립트 추가

```html
<script>
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            location.reload();
        }
    });
</script>
```

**하는 일**

- `pageshow`는 화면이 보일 때마다 실행된다. 처음 열 때와 뒤로가기로 돌아올 때 모두 해당한다.
- `event.persisted`가 `true`이면 bfcache에서 꺼낸 화면이라는 뜻이다. 이때만 `location.reload()`로 서버에서 목록을 다시 받아 최신 조회수를 보여준다.
- 처음 열거나 링크로 들어온 경우에는 `persisted`가 `false`라서 새로고침하지 않는다. 그래서 요청이 두 번 가거나 무한 새로고침되지 않는다.
- 목록 화면은 전체 목록과 내가 쓴 글이 함께 쓰므로 두 화면 모두 적용된다.

**결과 확인**

| 하는 일                                     | 기대 결과                               |
| ------------------------------------------- | --------------------------------------- |
| 로그인 → 게시판 → 내가 쓴 글                | 버튼이 "전체 글 보기"로 바뀜            |
| "전체 글 보기" 클릭                         | 전체 목록, 버튼은 다시 "내가 쓴 글"     |
| 목록 → 글 상세 → 뒤로가기                   | 목록의 조회수가 1 늘어난 값으로 보임    |

---

## 10주차 연습문제 - 게시판 개선하기

### ① 내가 쓴 글 페이징

**문제** : 9주차 "내가 쓴 글"은 내 글을 한 번에 전부 꺼냈다. 전체 목록처럼 10개씩 나눠 보여 주고, 페이지 번호도 붙인다.

**추가한 곳**

- `PostRepository` : `Page<Post> findByAuthor_Username(String username, Pageable pageable);`
- `PostService` : `findMinePage(username, page)` 메서드 추가
- `BoardController` : 기존 `my()`는 주석으로 남기고, `page` 파라미터를 받는 새 `my()`를 추가

**하는 일**

- 메서드 이름 조회도 맨 뒤에 `Pageable`만 더하면 결과가 `Page`가 된다. `LIMIT · OFFSET · count` SQL은 스프링이 붙여 준다.
- 정렬(최신 글이 위로)은 메서드 이름의 `OrderByIdDesc` 대신 `PageRequest.of(page, 10, Sort.by(DESC, "id"))`에 담아서 넘긴다. 전체 목록의 `findPage()`와 같은 방식이다.
- 새 `my()`는 `posts`(이번 페이지의 글), `page`(페이지 정보), `pageUrl = "/board/my"`를 화면에 넘긴다.
  - `list.html`의 페이지 번호는 `pageUrl`이 없으면 `/board`로 링크를 만든다. 그래서 `pageUrl`을 넘겨야 2페이지 링크가 `/board/my?page=1`이 되어 계속 내 글 안에서 이동한다.
- `/board/my`는 9주차와 같이 `SecurityConfig`의 `permitAll()`에 들어 있지 않으므로 로그인하지 않으면 로그인 화면으로 이동한다.
- 9주차의 `findMine()`, `findByAuthor_UsernameOrderByIdDesc()`는 지우지 않고 그대로 두었다.

### ② 작성자로 검색

**문제** : 검색 범위를 "제목+내용 / 작성자" 중에서 고를 수 있게 한다.

**추가한 곳**

- `PostRepository` : JPQL 메서드 `searchByWriter()` 추가

```java
@Query("SELECT p FROM Post p WHERE p.author.name LIKE %:name%")
Page<Post> searchByWriter(@Param("name") String name, Pageable pageable);
```

- `PostService` : `findPage(type, keyword, page)` 추가 (기존 `findPage(keyword, page)`는 그대로 두고 다시 사용)
- `BoardController` : 기존 `list()`는 주석으로 남기고, `type` 파라미터를 받는 새 `list()`를 추가

**하는 일**

- `p.author.name`은 글 → 작성자(Member) → 이름 순서로 따라간다. JPA가 `posts JOIN member`를 자동으로 만들어 준다.
- `:name`은 단계 2의 `:keyword`처럼 **파라미터 바인딩**이다. 그래서 작성자 검색에도 SQL 인젝션이 통하지 않는다.
- 서비스의 `findPage(type, keyword, page)`
  - `type`이 `writer`이고 검색어가 있으면 → `searchByWriter()` (작성자 이름 검색)
  - 그 밖에는 → 기존 `findPage(keyword, page)` (제목+내용 검색, 검색어가 없으면 전체)
- 컨트롤러는 `@RequestParam(defaultValue = "all") String type`으로 받고 `type`을 화면에 넘긴다.
  - `type`이 넘어오면 `list.html`에 검색 범위 선택 상자가 나타나고, 고른 값이 선택된 채로 유지된다.
  - 페이지 링크에도 `type=writer`가 붙어서 작성자 검색 결과의 2페이지도 작성자 검색으로 이어진다.
  - `writer`가 아닌 값(빈칸, 이상한 값)은 `all`로 바꿔서 기존 검색처럼 동작하게 했다.

**결과 확인**

| 하는 일                                 | 기대 결과                             |
| --------------------------------------- | ------------------------------------- |
| admin 로그인 → 내가 쓴 글               | 10개씩, 링크가 `/board/my?page=1`     |
| 로그인 안 하고 `/board/my`              | 로그인 화면                           |
| 작성자 선택 + "관리" 검색               | 관리자의 글만                         |
| 제목+내용 선택 + "관리" 검색            | 제목·내용에 "관리"가 들어간 글만      |
| 작성자 검색 결과 2페이지                | 주소에 `type=writer` 유지             |

---

## 10주차 추가 개선 - 댓글이 화면 밖으로 넘치는 문제

**문제** : 띄어쓰기 없이 긴 댓글(예 : `ㅋㅋㅋㅋ…`, 긴 주소)을 쓰면 댓글이 카드 밖으로 밀려나고 가로 스크롤이 생겼다.

**원인** : `.comment-content`의 `white-space: pre-wrap`은 줄바꿈을 그대로 보여 주지만, **공백이 있는 곳에서만** 줄을 바꾼다. 공백 없는 긴 글자는 한 단어로 취급되어 끊을 곳이 없으니 옆으로 계속 늘어났다. 글 내용(`.post-content`)과 제목도 같은 문제가 있었다.

**바꾼 곳**

- `static/css/board.css` 맨 아래에 규칙 추가 (기존 줄은 지우지 않고, 아래 규칙이 덮어쓴다)

```css
.comment-content,
.post-content,
.board-card h3,
.board-title { overflow-wrap: anywhere; word-break: break-word; }
.comment-item > .d-flex > .post-meta { min-width: 0; overflow-wrap: anywhere; }
.comment-list + form textarea { resize: vertical; max-width: 100%; }
```

**하는 일**

- `overflow-wrap: anywhere` : 한 줄에 들어갈 자리가 없으면 단어 중간에서라도 줄을 바꾼다. 그래서 긴 글자도 카드 너비 안에서 다음 줄로 내려간다.
- `word-break: break-word` : 같은 동작을 예전 브라우저에서도 하게 하는 보조 설정이다.
- 댓글뿐 아니라 글 내용, 상세 화면 제목, 목록 제목에도 같이 적용해서 같은 문제가 다른 곳에서 생기지 않게 했다.
- 댓글 작성자 줄은 `d-flex` 안에 있다. flex 항목은 기본적으로 내용보다 작아지지 않으므로 `min-width: 0`을 주어 긴 이름이 삭제 버튼을 밀어내지 않게 했다.
- 댓글 입력창은 위아래로만 크기를 바꿀 수 있게 해서, 끌어서 옆으로 늘려도 카드 밖으로 나가지 않게 했다.
- 공백이 있는 일반 문장은 전처럼 단어 단위로 줄이 바뀐다. 단어 중간에서 끊기는 것은 공백 없이 너무 긴 글자일 때뿐이다.

| 하는 일                                        | 기대 결과                               |
| ---------------------------------------------- | --------------------------------------- |
| 공백 없이 300자 정도의 댓글 등록               | 카드 안에서 여러 줄로 내려감, 가로 스크롤 없음 |
| 긴 주소(URL)를 댓글로 등록                     | 카드 안에서 줄바꿈                      |
| 보통 문장 댓글                                 | 전처럼 단어 단위로 줄바꿈               |
