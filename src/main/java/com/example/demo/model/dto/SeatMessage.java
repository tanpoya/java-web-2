package com.example.demo.model.dto;

import com.example.demo.model.domain.Post;

// [12주차] 단계 2 : 남은 자리 메시지 (서버 → 모든 브라우저, JSON 으로 바뀌어 간다)
public record SeatMessage(Long postId, int appliedCount, int capacity, int remaining) {
    public static SeatMessage from(Post post) {
        return new SeatMessage(post.getId(), post.getAppliedCount(), post.getCapacity(), post.getRemaining());
    }
}
