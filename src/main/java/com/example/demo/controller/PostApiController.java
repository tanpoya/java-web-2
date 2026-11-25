package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.dto.RecruitSummary;
import com.example.demo.model.service.PostService;

// [여백 활용 ⑥] 게시글 JSON API : 오른쪽 위젯(js/theme.js)이 fetch 로 부른다
@RestController
@RequestMapping("/api/posts")
public class PostApiController {
    @Autowired
    private PostService postService; // 다른 컨트롤러처럼 서비스를 거친다

    private static final int RECRUIT_LIMIT = 5; // 위젯에 보여 줄 개수

    // 모집 중인 글 : GET /api/posts/recruiting (누구나 - 게시판 목록처럼 공개 정보)
    // → [{"postId":109,"title":"...","appliedCount":1,"capacity":5,"remaining":4}, ...]
    @GetMapping("/recruiting")
    public List<RecruitSummary> recruiting() {
        return postService.findRecruiting(RECRUIT_LIMIT)
                .stream()
                .map(RecruitSummary::from) // 엔티티 → DTO (작성자 정보 같은 값이 JSON 으로 나가지 않게)
                .toList();
    }
}
