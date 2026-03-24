package project.TeamFive.ExLMS.group.dto.response;

import lombok.Builder;
import lombok.Data;
import project.TeamFive.ExLMS.group.entity.GroupFeedPost.LinkedEntityType;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class GroupFeedPostResponse {
    private UUID id;
    private UUID groupId;
    private UUID authorId;
    private String authorName;
    private String authorAvatarKey;
    private String content;
    private UUID linkedEntityId;
    private LinkedEntityType linkedEntityType;
    private boolean pinned;
    private int reactionCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
