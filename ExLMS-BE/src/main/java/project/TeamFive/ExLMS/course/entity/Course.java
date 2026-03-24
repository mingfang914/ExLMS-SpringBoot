package project.TeamFive.ExLMS.course.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDate;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course extends BaseEntity {

    // Khóa ngoại liên kết với Nhóm học tập
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_key", length = 36)
    private String thumbnailKey;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Builder.Default
    @Column(nullable = false)
    private String status = "DRAFT"; // DRAFT, PUBLISHED, ENDED, ARCHIVED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
}
