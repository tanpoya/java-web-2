package com.example.demo.model.dto;

// [12주차] 단계 4 : 개인 알림 (서버 → 한 사람) : to = 받을 사람 아이디
public record Notification(String to, String text, Long postId) {
}
