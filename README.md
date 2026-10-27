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

| 주소 | USER | MANAGER | ADMIN |
|---|---|---|---|
| /mypage | ✓ | ✓ | ✓ |
| /testdb | 403 | ✓ | ✓ |
| /admin/** | 403 | 403 | ✓ |

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

| 테스트 | 결과 |
|---|---|
| 검색 `?keyword=test` | 200, 아이디·이름에 test 포함 회원만 |
| 같은 아이디로 등록 | 400 `이미 사용 중인 아이디입니다.` |
| 비밀번호 확인 불일치 | 400 `비밀번호가 일치하지 않습니다.` |
| 권한 `SUPER`로 변경 | 400 `허용되지 않는 권한입니다 : SUPER` |
| 관리자가 본인 권한 변경/삭제 | 400 `자기 자신의 권한 변경·삭제는 할 수 없습니다.` |
| USER 계정으로 관리자 API | 403 |
| 회원 등록 / 삭제 | 201 / 204 |

---

## 문제 해결 기록

| 증상 | 원인 → 해결 |
|---|---|
| 서버 실행 시 `Access denied for user ... (using password: NO)` | DB 계정 정보를 담은 `application-secret.properties`가 `.gitignore`에 들어 있어서 다른 PC로 가져오면 빠져 있었다. `optional:`로 불러오기 때문에 오류 없이 넘어가고, 계정 없이 접속하다 실패한 것이다. → 파일을 다시 만들어 해결 |
| AI 아이콘이 화면에 안 나옴 | 로컬 `bootstrap-icons.css`가 예전 버전 → 최신 CDN 링크 추가 |
| curl로 테스트하면 로그인 화면(302) 대신 401 | 7주차에 `httpBasic()`을 켜서, 브라우저가 아닌 요청에는 401을 응답한다. 브라우저에서는 그대로 로그인 화면으로 이동한다. |
| 권한을 바꿨는데 메뉴가 그대로 | 권한은 로그인할 때 세션에 복사된다 → 다시 로그인해야 반영 |

> 주의 : DB 비밀번호는 `application-secret.properties`에만 두고 GitHub에 올리지 않는다. (5주차)
