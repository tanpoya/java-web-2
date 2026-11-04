package com.example.demo.model.domain;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;

@Entity // 게시글 엔티티 : posts 테이블
@Table(name = "posts")
@Data // set/get/tostring 등 필수 메서드 자동 생성
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가 (1, 2, 3 ...)
    private Long id;
    @Column(nullable = false, length = 100) // 제목 : 필수, 100자까지
    private String title;
    @Column(nullable = false, columnDefinition = "TEXT") // 내용 : 긴 글도 저장
    private String content;
    @ManyToOne(fetch = FetchType.LAZY) // 작성자 : 회원 1명이 글 여러 개 (N : 1)
    @JoinColumn(name = "member_id", nullable = false) // 외래 키(FK) 컬럼 이름
    private Member author;
    @Column(nullable = false) // 작성 시간
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt; // 수정 시간 (수정한 적 없으면 null)
    @Column(nullable = false) // 조회수 (연습문제에서 사용)
    private int viewCount = 0;
}
