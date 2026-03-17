package project.TeamFive.ExLMS.group.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.group.entity.StudyGroup;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, UUID> {
    // Tìm nhóm dựa vào mã mời
    Optional<StudyGroup> findByInviteCode(String inviteCode);
}
