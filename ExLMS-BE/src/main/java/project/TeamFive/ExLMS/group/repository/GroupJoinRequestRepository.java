package project.TeamFive.ExLMS.group.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // Tìm tất cả yêu cầu PENDING của nhóm dùng native SQL UNHEX để handle BINARY(16)
    @Query(value = "SELECT * FROM group_join_requests WHERE group_id = UNHEX(REPLACE(:groupId, '-', '')) AND status = :status", nativeQuery = true)
    List<GroupJoinRequest> findPendingByGroupId(@Param("groupId") String groupId, @Param("status") String status);
}
