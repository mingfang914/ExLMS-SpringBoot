package project.TeamFive.ExLMS.meeting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.TeamFive.ExLMS.meeting.entity.Meeting;

import java.util.List;
import java.util.UUID;

public interface MeetingRepository extends JpaRepository<Meeting, UUID> {
    List<Meeting> findByGroup_IdOrderByStartAtDesc(UUID groupId);
}
