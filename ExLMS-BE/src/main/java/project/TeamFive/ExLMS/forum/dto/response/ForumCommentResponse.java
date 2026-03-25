package project.TeamFive.ExLMS.forum.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.forum.entity.ForumComment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumCommentResponse {
    private UUID id;
    private String authorName;
    private UUID authorId;
    private String authorAvatarKey;
    private String content;
    private int upvoteCount;
    private boolean accepted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ForumCommentResponse> replies;

    public static ForumCommentResponse fromEntity(ForumComment comment) {
        return ForumCommentResponse.builder()
                .id(comment.getId())
                .authorName(comment.getAuthor().getFullName())
                .authorId(comment.getAuthor().getId())
                .authorAvatarKey(comment.getAuthor().getAvatarKey())
                .content(comment.getContent())
                .upvoteCount(comment.getUpvoteCount())
                .accepted(comment.isAccepted())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .replies(comment.getChildren().stream()
                        .map(ForumCommentResponse::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }
}
