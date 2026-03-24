package project.TeamFive.ExLMS.meeting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.meeting.entity.MeetingQuestion;

import java.util.List;
import java.util.UUID;

@Repository
public interface MeetingQuestionRepository extends JpaRepository<MeetingQuestion, UUID> {
    List<MeetingQuestion> findByMeeting_IdOrderByCreatedAtAsc(UUID meetingId);
}
