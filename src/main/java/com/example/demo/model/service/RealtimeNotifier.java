package com.example.demo.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import com.example.demo.model.dto.SeatMessage;
import com.example.demo.model.dto.Notification;

@Component // [12주차] 단계 3 : 트랜잭션이 커밋된 뒤에 실시간 메시지를 보낸다
public class RealtimeNotifier {
    @Autowired
    private SimpMessagingTemplate messagingTemplate; // 브로커로 메시지를 보내는 도구(스프링 지원)

    @TransactionalEventListener // 기본 = AFTER_COMMIT : 커밋이 성공했을 때만 (롤백되면 보내지 않는다)
    public void sendSeats(SeatMessage message) {
        messagingTemplate.convertAndSend("/topic/seats", message); // /topic/seats 를 구독한 모든 사람에게
    }

    @TransactionalEventListener // 단계 4 : 개인 알림도 커밋 뒤에
    public void sendNotification(Notification notification) {
        messagingTemplate.convertAndSendToUser(notification.to(), "/queue/notifications", notification); // 그 사람에게만
    }

}
