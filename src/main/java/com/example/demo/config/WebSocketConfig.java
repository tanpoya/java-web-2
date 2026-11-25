package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration // [12주차 제공] WebSocket + STOMP 설정
@EnableWebSocketMessageBroker // STOMP 메시지 중개(브로커) 기능을 켠다
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override // ① 연결 주소 : ws://localhost:8080/ws
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws"); // 허용 출처를 따로 정하지 않으면 "같은 사이트"에서만 연결된다 (setAllowedOrigins("*") 금지)
    }

    @Override // ② 주소 규칙
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue"); // 서버 → 브라우저 : /topic = 여러 명, /queue = 한 사람
        registry.setApplicationDestinationPrefixes("/app"); // 브라우저 → 서버 (@MessageMapping, 오늘은 쓰지 않음)
        registry.setUserDestinationPrefix("/user"); // 특정 사용자에게 : /user/queue/...
    }
}
