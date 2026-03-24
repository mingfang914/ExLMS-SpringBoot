package project.TeamFive.ExLMS.group.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.user.entity.User;

@Entity
@Table(name = "group_feed_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupFeedComment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feed_post_id", nullable = false)
    private GroupFeedPost feedPost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
}
