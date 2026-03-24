package project.TeamFive.ExLMS.group.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.user.entity.User;

@Entity
@Table(name = "group_feed_reactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupFeedReaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feed_post_id", nullable = false)
    private GroupFeedPost feedPost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 10)
    private String emoji = "👍";
}
