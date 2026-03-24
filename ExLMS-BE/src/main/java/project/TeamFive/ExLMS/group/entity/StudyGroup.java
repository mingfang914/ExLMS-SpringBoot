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

    @Builder.Default
    @Column(nullable = false)
    private String visibility = "PUBLIC"; // PUBLIC hoặc PRIVATE

    @Builder.Default
    @Column(name = "auto_approve", nullable = false)
    private boolean autoApprove = false; // "Tham gia ngay" không cần duyệt

    @Column(name = "invite_code", length = 20, unique = true)
    private String inviteCode;

    @Builder.Default
    @Column(name = "max_members", nullable = false)
    private int maxMembers = 100;

    @Builder.Default
    @Column(name = "member_count", nullable = false)
    private int memberCount = 1;

    @Column(length = 80)
    private String category;

    @Builder.Default
    @Column(nullable = false, length = 10)
    private String language = "vi";

    @Builder.Default
    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, ARCHIVED, DELETED
}
