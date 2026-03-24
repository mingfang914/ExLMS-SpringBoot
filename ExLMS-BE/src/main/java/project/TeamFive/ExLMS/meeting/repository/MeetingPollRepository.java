package project.TeamFive.ExLMS.meeting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.meeting.entity.MeetingPoll;

import java.util.List;
import java.util.UUID;

@Repository
public interface MeetingPollRepository extends JpaRepository<MeetingPoll, UUID> {
    List<MeetingPoll> findByMeeting_Id(UUID meetingId);
}
