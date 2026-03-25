package project.TeamFive.ExLMS.forum.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.forum.dto.request.CreatePostRequest;
import project.TeamFive.ExLMS.forum.dto.response.ForumPostResponse;
import project.TeamFive.ExLMS.forum.entity.ForumPost;
import project.TeamFive.ExLMS.forum.entity.ForumTag;
import project.TeamFive.ExLMS.forum.repository.ForumPostRepository;
import project.TeamFive.ExLMS.forum.repository.ForumTagRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumPostRepository postRepository;
    private final ForumTagRepository tagRepository;
    private final ForumTagService tagService;

    @Transactional(readOnly = true)
    public List<ForumPostResponse> searchPosts(String query, String tagSlug, String status) {
        return postRepository.findAll((root, criteriaQuery, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            
            if (query != null && !query.isBlank()) {
                String searchPattern = "%" + query.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), searchPattern),
                    cb.like(cb.lower(root.get("content")), searchPattern)
                ));
            }
            
            if (tagSlug != null && !tagSlug.isBlank()) {
                predicates.add(cb.equal(root.join("tags").get("slug"), tagSlug));
            }
            
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), ForumPost.PostStatus.valueOf(status)));
            } else {
                predicates.add(cb.notEqual(root.get("status"), ForumPost.PostStatus.DELETED));
            }
            
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }).stream()
        .map(ForumPostResponse::fromEntity)
        .collect(Collectors.toList());
    }

    @Transactional
    public ForumPostResponse createPost(CreatePostRequest request, User author) {
        Set<ForumTag> tags = new HashSet<>();
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            tags.addAll(tagRepository.findAllById(request.getTagIds()));
        }

        if (request.getTagNames() != null && !request.getTagNames().isBlank()) {
            tags.addAll(tagService.getOrCreateTags(request.getTagNames(), author));
        }

        ForumPost post = ForumPost.builder()
                .author(author)
                .title(request.getTitle())
                .content(request.getContent())
                .status(ForumPost.PostStatus.PUBLISHED)
                .tags(tags)
                .build();

        return ForumPostResponse.fromEntity(postRepository.save(post));
    }

    @Transactional(readOnly = true)
    public List<ForumPostResponse> getAllPosts() {
        return postRepository.findAll().stream()
                .map(ForumPostResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ForumPostResponse getPostById(UUID id) {
        ForumPost post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Increment view count
        post.setViewCount(post.getViewCount() + 1);
        return ForumPostResponse.fromEntity(postRepository.save(post));
    }

    @Transactional
    public void togglePin(UUID postId, boolean pin) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setPinned(pin);
        postRepository.save(post);
    }

    @Transactional
    public ForumPostResponse updatePost(UUID postId, CreatePostRequest request, User author) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getAuthor().getId().equals(author.getId())) {
            throw new RuntimeException("Chỉ tác giả mới có quyền sửa bài viết!");
        }

        if (request.getTitle() != null) post.setTitle(request.getTitle());
        if (request.getContent() != null) post.setContent(request.getContent());

        if (request.getTagIds() != null || request.getTagNames() != null) {
            Set<ForumTag> tags = new HashSet<>();
            if (request.getTagIds() != null) {
                tags.addAll(tagRepository.findAllById(request.getTagIds()));
            }
            if (request.getTagNames() != null) {
                tags.addAll(tagService.getOrCreateTags(request.getTagNames(), author));
            }
            post.setTags(tags);
        }

        return ForumPostResponse.fromEntity(postRepository.save(post));
    }

    @Transactional
    public String deletePost(UUID postId, User author) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getAuthor().getId().equals(author.getId())) {
            throw new RuntimeException("Chỉ tác giả mới có quyền xóa bài viết!");
        }

        post.setStatus(ForumPost.PostStatus.DELETED); // soft delete
        postRepository.save(post);
        return "Đã xóa bài viết thành công!";
    }
}
