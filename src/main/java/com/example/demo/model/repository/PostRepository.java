package com.example.demo.model.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.demo.model.domain.Post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.demo.model.domain.Member;

@Repository // 게시글 리포지토리 : save, findAll, findById, delete 는 이미 있다
public interface PostRepository extends JpaRepository<Post, Long> {

    // [9주차 연습문제 ②] 작성자(author)의 username 으로 찾고, 번호 큰 순서(최신 글)로
    // → SELECT ... FROM posts p JOIN member m ... WHERE m.username = ? ORDER BY
    // p.id DESC
    List<Post> findByAuthor_UsernameOrderByIdDesc(String username);

    // [10주차] 단계 2 : 제목 또는 내용에 검색어가 들어간 글 (JPQL)
    @Query("SELECT p FROM Post p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword%")
    Page<Post> search(@Param("keyword") String keyword, Pageable pageable);

    boolean existsByAuthor(Member author); // 글 작성자가 존재하는지 (댓글 삭제 시 필요)
}
