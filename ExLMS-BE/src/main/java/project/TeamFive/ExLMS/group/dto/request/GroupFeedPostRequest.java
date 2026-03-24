package project.TeamFive.ExLMS.group.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.group.entity.GroupFeedPost;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupFeedPostRequest {
    private String content;
    private UUID linkedEntityId;
    private GroupFeedPost.LinkedEntityType linkedEntityType;
    private boolean pinned;
}
