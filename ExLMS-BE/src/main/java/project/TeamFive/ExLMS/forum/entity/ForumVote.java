package project.TeamFive.ExLMS.forum.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.UUID;

@Entity
@Table(name = "forum_votes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumVote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "target_id", nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.BINARY)
    private UUID targetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private TargetType targetType;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote_type", nullable = false)
    @Builder.Default
    private VoteType voteType = VoteType.UPVOTE;

    public enum TargetType {
        FORUM_POST, FORUM_COMMENT
    }

    public enum VoteType {
        UPVOTE, DOWNVOTE
    }
}
