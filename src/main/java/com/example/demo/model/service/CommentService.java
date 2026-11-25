package com.example.demo.model.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import com.example.demo.model.domain.Comment;
import com.example.demo.model.domain.Member;
import com.example.demo.model.domain.Post;
import com.example.demo.model.repository.CommentRepository;
import com.example.demo.model.dto.Notification; // [12주차 연습문제 ②]
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.repository.MemberRepository; // 필드 3 개 가져다 쓰는 것 하는 일 commentRepository 댓글 저장·조회·삭제 memberRepository 작성자 찾기(username→회원)postService(9 주차)글 찾기—없으면 404 처리까지 재사용

@Service // 댓글 서비스
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private PostService postService; // 글 찾기는 9주차 PostService 를 그대로 쓴다
    @Autowired // [12주차 연습문제 ②] 댓글 알림 이벤트 발행 (보내기는 커밋 뒤에 RealtimeNotifier 가)
    private ApplicationEventPublisher eventPublisher;

    public List<Comment> findByPost(Post post) { // 이 글의 댓글 목록
        return commentRepository.findByPostOrderByIdAsc(post);
    }

    // public Comment write(Long postId, String content, String username) { // 댓글 쓰기
    //     if (content == null || content.isBlank() || content.length() > 500) {
    //         throw new IllegalArgumentException("댓글은 1~500자로 입력하세요.");
    //     }
    //     Post post = postService.findById(postId); // 없는 글이면 404
    //     Member author = memberRepository.findByUsername(username)
    //             .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));
    //     Comment comment = new Comment();
    //     comment.setContent(content.trim());
    //     comment.setPost(post); // 어느 글의 댓글인지
    //     comment.setAuthor(author); // 작성자는 서버가 정한다
    //     comment.setCreatedAt(LocalDateTime.now());
    //     return commentRepository.save(comment); // INSERT
    // }

    // [12주차 연습문제 ②] 댓글 알림 : 내 글에 댓글이 달리면 글쓴이에게 실시간 알림
    // @Transactional 추가 : 트랜잭션이 없으면 @TransactionalEventListener(RealtimeNotifier) 가 실행되지 않는다
    @Transactional
    public Comment write(Long postId, String content, String username) { // 댓글 쓰기
        if (content == null || content.isBlank() || content.length() > 500) {
            throw new IllegalArgumentException("댓글은 1~500자로 입력하세요.");
        }
        Post post = postService.findById(postId); // 없는 글이면 404
        Member author = memberRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));
        Comment comment = new Comment();
        comment.setContent(content.trim());
        comment.setPost(post); // 어느 글의 댓글인지
        comment.setAuthor(author); // 작성자는 서버가 정한다
        comment.setCreatedAt(LocalDateTime.now());
        Comment saved = commentRepository.save(comment); // INSERT

        String writer = post.getAuthor().getUsername();
        if (!writer.equals(username)) { // 내 글에 내 댓글은 알림 없음
            eventPublisher.publishEvent(new Notification(writer,
                    author.getName() + "님이 '" + post.getTitle() + "' 에 댓글을 남겼습니다.", post.getId()));
        }
        return saved;
    }

    public void delete(Long id) { // 댓글 삭제 (본인 또는 관리자)
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글이 존재하지 않습니다."));
        if (!isAdmin())
            checkWriter(comment);
        commentRepository.delete(comment); // DELETE
    }

    private void checkWriter(Comment comment) { // 로그인한 사람이 댓글 작성자인지 → 아니면 403
        String loginUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!comment.getAuthor().getUsername().equals(loginUsername)) {
            throw new AccessDeniedException("본인이 쓴 댓글만 삭제할 수 있습니다.");
        }
    }

    private boolean isAdmin() { // 로그인한 사람이 관리자인지
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

}