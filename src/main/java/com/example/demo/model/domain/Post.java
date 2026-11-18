package com.example.demo.model.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.util.List;

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

    // 글 1개 → 댓글 여러 개 (1 : N). 글을 지우면 댓글도 함께 지운다
    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE) // 외래 키는 Comment.post 가 관리
    @ToString.Exclude
    @EqualsAndHashCode.Exclude // 글 → 댓글 → 글 … 무한 반복 방지
    private List<Comment> comments = new ArrayList<>();

    // [11주차] 단계 1 : 모집글 (정원이 있으면 모집글, null 이면 일반 글)
    private Integer capacity; // 정원 (모집 인원)
    @Column(nullable = false) // 신청한 인원 (신청 확정마다 1 증가)
    private int appliedCount = 0;
    private String posterFile; // 포스터 이미지 : uploads/ 에 저장된 파일 이름 (단계 2)

    public boolean isRecruit() {
        return capacity != null;
    } // 모집글인가

    public boolean isFull() {
        return isRecruit() && appliedCount >= capacity;
    } // 마감인가

    public int getRemaining() {
        return isRecruit() ? capacity - appliedCount : 0;
    } // 남은 자리
}
