package com.example.demo.model.domain;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;

@Entity // 댓글 엔티티 : comments 테이블
@Table(name = "comments")
@Data
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 500) // 댓글 내용 : 필수, 500자까지
    private String content;
    @ManyToOne(fetch = FetchType.LAZY) // 어느 글의 댓글인지 (글 1 : 댓글 N)
    @JoinColumn(name = "post_id", nullable = false) // 외래 키 → posts.id
    private Post post;
    @ManyToOne(fetch = FetchType.LAZY) // 댓글 작성자 (9주차 글 작성자와 같은 방법)
    @JoinColumn(name = "member_id", nullable = false) // 외래 키 → member.id
    private Member author;
    @Column(nullable = false) // 작성 시간
    private LocalDateTime createdAt;
}
