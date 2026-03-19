package project.TeamFive.ExLMS.forum.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;

@Entity
@Table(name = "forum_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumAttachment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private ForumPost post;

    @Column(nullable = false, length = 255)
    private String filename;

    @Column(name = "object_key", nullable = false, unique = true, length = 36)
    private String objectKey;

    @Column(name = "file_size", nullable = false)
    private int fileSize;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;
}
