package project.TeamFive.ExLMS.group.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Entity
@Immutable // Cực kỳ quan trọng: Báo cho Hibernate biết đây là View, cấm thao tác INSERT/UPDATE
@Table(name = "v_group_members_detail")
@Getter
public class GroupMemberDetailView {

    // Trong View không có ID riêng, ta mượn user_id làm ID tạm để Hibernate không báo lỗi
    @Id
    @Column(name = "user_id", columnDefinition = "VARCHAR(36)")
    private String userId;

    @Column(name = "group_id", columnDefinition = "VARCHAR(36)")
    private String groupId;

    private String role;
    private String status;
    
    @Column(name = "joined_at")
    private LocalDateTime joinedAt;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "avatar_key")
    private String avatarKey;
    
    private String email;
    
    @Column(name = "platform_role")
    private String platformRole;
}
