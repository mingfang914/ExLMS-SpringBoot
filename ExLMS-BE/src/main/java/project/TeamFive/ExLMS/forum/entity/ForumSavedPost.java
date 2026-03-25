package project.TeamFive.ExLMS.forum.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.user.entity.User;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "forum_saved_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ForumSavedPost.SavedPostId.class)
public class ForumSavedPost {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private ForumPost post;

    @CreationTimestamp
    @Column(name = "saved_at", updatable = false)
    private LocalDateTime savedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SavedPostId implements Serializable {
        private User user;
        private ForumPost post;
    }
}
