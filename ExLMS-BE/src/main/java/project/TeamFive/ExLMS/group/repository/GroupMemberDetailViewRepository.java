package project.TeamFive.ExLMS.group.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.group.entity.GroupMemberDetailView;

import java.util.List;

@Repository
public interface GroupMemberDetailViewRepository extends JpaRepository<GroupMemberDetailView, String> {
    
    // Tìm tất cả thành viên của một nhóm cụ thể
    List<GroupMemberDetailView> findByGroupId(String groupId);
}
