package project.TeamFive.ExLMS.group.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.group.entity.GroupFeedPost;
import project.TeamFive.ExLMS.group.entity.StudyGroup;

import java.util.UUID;

@Repository
public interface GroupFeedPostRepository extends JpaRepository<GroupFeedPost, UUID> {
    Page<GroupFeedPost> findByGroupOrderByPinnedDescCreatedAtDesc(StudyGroup group, Pageable pageable);

    Page<GroupFeedPost> findByGroupAndLinkedEntityTypeOrderByPinnedDescCreatedAtDesc(StudyGroup group, GroupFeedPost.LinkedEntityType type, Pageable pageable);

    Page<GroupFeedPost> findByGroupAndPinnedIsTrueOrderByCreatedAtDesc(StudyGroup group, Pageable pageable);
}
