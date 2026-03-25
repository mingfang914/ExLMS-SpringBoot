package project.TeamFive.ExLMS.forum.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.user.entity.User;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "forum_tag_followers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ForumTagFollower.TagFollowerId.class)
public class ForumTagFollower {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private ForumTag tag;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagFollowerId implements Serializable {
        private User user;
        private ForumTag tag;
    }
}
