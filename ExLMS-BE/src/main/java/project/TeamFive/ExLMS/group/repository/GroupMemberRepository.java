package project.TeamFive.ExLMS.group.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, UUID> {

    // Kiểm tra xem User này đã là thành viên của Group này chưa
    boolean existsByGroupAndUser(StudyGroup group, User currentUser);

    // Dùng cú pháp chuẩn của Spring Data JPA, nó sẽ TỰ ĐỘNG sinh ra câu lệnh SQL
    // chuẩn xác
    Optional<GroupMember> findByGroup_IdAndUser_Id(UUID groupId, UUID userId);

    // Native SQL với UNHEX để xử lý BINARY(16) - dùng cho các service mới
    @Query(value = "SELECT * FROM group_members WHERE group_id = UNHEX(REPLACE(:groupId, '-', '')) AND user_id = UNHEX(REPLACE(:userId, '-', '')) LIMIT 1", nativeQuery = true)
    Optional<GroupMember> findByGroupIdAndUserId(@Param("groupId") String groupId, @Param("userId") String userId);

    @Query(value = "SELECT * FROM group_members WHERE group_id = UNHEX(REPLACE(:groupId, '-', ''))", nativeQuery = true)
    List<GroupMember> findAllByGroupId(@Param("groupId") String groupId);

    @Query(value = "SELECT * FROM group_members WHERE user_id = UNHEX(REPLACE(:userId, '-', ''))", nativeQuery = true)
    List<GroupMember> findAllByUserId(@Param("userId") String userId);
    
    Optional<GroupMember> findByGroupAndUser(StudyGroup group, User user);

    List<GroupMember> findByGroup_Id(UUID groupId);
}