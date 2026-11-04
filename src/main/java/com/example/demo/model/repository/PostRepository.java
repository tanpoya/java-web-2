package com.example.demo.model.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.model.domain.Post;

@Repository // 게시글 리포지토리 : save, findAll, findById, delete 는 이미 있다
public interface PostRepository extends JpaRepository<Post, Long> {
    // [9주차 연습문제 ②] 작성자(author)의 username 으로 찾고, 번호 큰 순서(최신 글)로
    // → SELECT ... FROM posts p JOIN member m ... WHERE m.username = ? ORDER BY p.id DESC
    List<Post> findByAuthor_UsernameOrderByIdDesc(String username);
}
