package project.TeamFive.ExLMS.meeting.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "meeting_polls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingPoll extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Builder.Default
    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingPollOption> options = new ArrayList<>();
}
