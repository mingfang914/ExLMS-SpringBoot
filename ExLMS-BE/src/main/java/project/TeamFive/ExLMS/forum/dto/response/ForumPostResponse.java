package project.TeamFive.ExLMS.forum.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.forum.entity.ForumPost;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumPostResponse {
    private UUID id;
    private String authorName;
    private UUID authorId;
    private String authorAvatarKey;
    private String title;
    private String content;
    private ForumPost.PostStatus status;
    private int viewCount;
    private int upvoteCount;
    private boolean pinned;
    private boolean closed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<TagResponse> tags;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagResponse {
        private UUID id;
        private String name;
        private String slug;
        private String color;
    }

    public static ForumPostResponse fromEntity(ForumPost post) {
        return ForumPostResponse.builder()
                .id(post.getId())
                .authorName(post.getAuthor().getFullName())
                .authorId(post.getAuthor().getId())
                .authorAvatarKey(post.getAuthor().getAvatarKey())
                .title(post.getTitle())
                .content(post.getContent())
                .status(post.getStatus())
                .viewCount(post.getViewCount())
                .upvoteCount(post.getUpvoteCount())
                .pinned(post.isPinned())
                .closed(post.isClosed())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .tags(post.getTags().stream()
                        .map(tag -> TagResponse.builder()
                                .id(tag.getId())
                                .name(tag.getName())
                                .slug(tag.getSlug())
                                .color(tag.getColor())
                                .build())
                        .collect(Collectors.toSet()))
                .build();
    }
}
