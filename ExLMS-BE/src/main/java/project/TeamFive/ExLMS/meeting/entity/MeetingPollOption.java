package project.TeamFive.ExLMS.meeting.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;

@Entity
@Table(name = "meeting_poll_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingPollOption extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private MeetingPoll poll;

    @Column(nullable = false, length = 200)
    private String label;

    @Column(name = "vote_count", nullable = false)
    @Builder.Default
    private int voteCount = 0;
}
