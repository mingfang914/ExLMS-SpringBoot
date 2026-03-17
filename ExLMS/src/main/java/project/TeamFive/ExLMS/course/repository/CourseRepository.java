package project.TeamFive.ExLMS.course.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.course.entity.Course;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    // Tìm tất cả khóa học thuộc về 1 nhóm
    List<Course> findByGroup_Id(UUID groupId);
}
