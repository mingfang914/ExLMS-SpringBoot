package project.TeamFive.ExLMS.group.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, UUID> {
    // Kiểm tra xem User này đã là thành viên của Group này chưa (tránh tham gia 2 lần)
    boolean existsByGroupAndUser(StudyGroup group, User currentUser);

    // Tìm thẻ thành viên của một user trong một nhóm cụ thể
    Optional<GroupMember> findByGroupAndUser(StudyGroup group, User user);
}
