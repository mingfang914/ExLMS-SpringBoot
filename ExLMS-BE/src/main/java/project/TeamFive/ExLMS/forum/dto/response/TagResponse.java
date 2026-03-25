package project.TeamFive.ExLMS.forum.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.forum.entity.ForumTag;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagResponse {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String color;
    private int postCount;

    public static TagResponse fromEntity(ForumTag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .slug(tag.getSlug())
                .description(tag.getDescription())
                .color(tag.getColor())
                .postCount(tag.getPostCount())
                .build();
    }
}
