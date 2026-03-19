package project.TeamFive.ExLMS.group.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.user.entity.User;

@Entity
@Table(name = "study_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyGroup extends BaseEntity {

    // Khóa ngoại liên kết với User (Người tạo nhóm)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_key", length = 36)
    private String coverKey;

    @Column(nullable = false)
    private String visibility = "PUBLIC"; // PUBLIC hoặc PRIVATE

    @Column(name = "invite_code", length = 20, unique = true)
    private String inviteCode;

    @Column(name = "max_members", nullable = false)
    private int maxMembers = 100;

    @Column(name = "member_count", nullable = false)
    private int memberCount = 1;

    @Column(length = 80)
    private String category;

    @Column(nullable = false, length = 10)
    private String language = "vi";

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, ARCHIVED, DELETED
}
