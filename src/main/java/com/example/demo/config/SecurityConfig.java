package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

import org.springframework.security.config.Customizer;

@Configuration // 스프링 설정 클래스 등록
@EnableWebSecurity // 스프링 시큐리티 활성화
@EnableMethodSecurity // [6주차] 메서드 보안 활성화 : @PreAuthorize 사용

public class SecurityConfig {
        @Bean // 비밀번호 암호화 객체 등록 (BCrypt 해시)
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean // 보안 필터 체인 등록
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .authorizeHttpRequests(auth -> auth // 1. URL 접근 규칙 (인가)
                                                .requestMatchers("/", "/hello", "/detailed_web.html",
                                                                "/login", "/signup", "/error")
                                                .permitAll()
                                                .requestMatchers("/css/**", "/js/**", "/images/**", "/fonts/**")
                                                .permitAll()
                                                // .requestMatchers("/admin/**").hasRole("ADMIN") // [6주차] 관리자만
                                                .requestMatchers("/admin/**",
                                                                "/api/admin/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/api/hello").permitAll()
                                                // [3주차 연습문제] 기술 상세 페이지 (AI, 보안, 게임) : 누구나
                                                .requestMatchers("/detailed_ai.html", "/detailed_security.html",
                                                                "/detailed_game.html")
                                                .permitAll()
                                                // [6주차 연습문제] /testdb(회원목록) 는 ADMIN, MANAGER 만 (USER 403)
                                                .requestMatchers("/testdb").hasAnyRole("ADMIN", "MANAGER")
                                                .requestMatchers("/board", "/board/{id:\\d+}").permitAll() // 게시판 목록·상세
                                                                                                           // : 누구나
                                                .anyRequest().authenticated())
                                .formLogin(form -> form // 2. 폼 로그인 설정 (인증)
                                                .loginPage("/login")
                                                .defaultSuccessUrl("/")
                                                .failureUrl("/login?error")
                                                .permitAll())
                                .logout(logout -> logout // 3. 로그아웃 설정
                                                .logoutUrl("/logout") // 로그아웃 처리 URL (POST)
                                                .logoutSuccessUrl("/login?logout") // 로그아웃 후 이동
                                                .invalidateHttpSession(true) // 세션 삭제
                                                .deleteCookies("JSESSIONID", "remember-me")) // 쿠키 삭제
                                // 4. [5주차 연습문제] 로그인 상태 유지 (login.html 체크박스 name="remember-me")
                                .rememberMe(remember -> remember
                                                .key("javaweb-remember-me-key") // 쿠키 서명용 비밀키
                                                .tokenValiditySeconds(60 * 60 * 24 * 7)) // 7일 유지
                                // 5. [7주차] REST API 설정
                                .httpBasic(Customizer.withDefaults()) // Postman : 요청마다 아이디·비밀번호 (Basic 인증)
                                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**")) // JSON API 는 CSRF 토큰 검사 제외
                                .exceptionHandling(ex -> ex.defaultAuthenticationEntryPointFor( // 로그인 안 한 API 요청 :
                                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), // 로그인 화면(302) 대신 401
                                                request -> request.getRequestURI().startsWith("/api/")));

                return http.build();
        }
}
