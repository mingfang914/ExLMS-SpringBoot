package project.TeamFive.ExLMS.group.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.group.entity.GroupJoinRequest;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupJoinRequestRepository extends JpaRepository<GroupJoinRequest, UUID> {
    // Kiểm tra xem user này đã gửi yêu cầu (đang chờ duyệt) chưa, tránh spam
    boolean existsByGroupAndUserAndStatus(StudyGroup group, User user, String status);
    // Tìm tất cả các yêu cầu của một nhóm theo trạng thái
    List<GroupJoinRequest> findByGroup_IdAndStatus(UUID groupId, String status);
}
