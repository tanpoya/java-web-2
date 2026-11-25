package com.example.demo.model.dto;

import com.example.demo.model.domain.Post;

// [여백 활용 ⑥] 오른쪽 위젯 "모집 중" 목록에 보낼 값 (엔티티 대신 필요한 값만 → 7주차 MemberResponse 와 같은 방식)
// postId · appliedCount · capacity · remaining 은 12주차 SeatMessage 와 이름이 같다
// → 실시간 남은 자리 메시지가 오면 realtime.js 가 위젯의 숫자도 그대로 바꿀 수 있다
public record RecruitSummary(Long postId, String title, int appliedCount, int capacity, int remaining) {
    public static RecruitSummary from(Post post) {
        return new RecruitSummary(post.getId(), post.getTitle(), post.getAppliedCount(),
                post.getCapacity(), post.getRemaining());
    }
}
