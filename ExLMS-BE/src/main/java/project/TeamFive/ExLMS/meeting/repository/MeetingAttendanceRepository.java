package project.TeamFive.ExLMS.meeting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.meeting.entity.MeetingAttendance;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MeetingAttendanceRepository extends JpaRepository<MeetingAttendance, UUID> {
    List<MeetingAttendance> findByMeeting_Id(UUID meetingId);
    Optional<MeetingAttendance> findByMeeting_IdAndUser_Id(UUID meetingId, UUID userId);
}
