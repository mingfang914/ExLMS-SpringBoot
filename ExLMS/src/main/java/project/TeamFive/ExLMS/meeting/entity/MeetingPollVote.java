package project.TeamFive.ExLMS.meeting.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.user.entity.User;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "meeting_poll_votes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingPollVote {

    @EmbeddedId
    private MeetingPollVoteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("pollId")
    @JoinColumn(name = "poll_id")
    private MeetingPoll poll;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private MeetingPollOption option;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class MeetingPollVoteId implements Serializable {
        @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.BINARY)
        private UUID pollId;
        @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.BINARY)
        private UUID userId;
    }
}
