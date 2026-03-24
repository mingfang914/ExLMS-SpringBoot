package project.TeamFive.ExLMS.meeting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.meeting.entity.MeetingPollVote;

@Repository
public interface MeetingPollVoteRepository extends JpaRepository<MeetingPollVote, MeetingPollVote.MeetingPollVoteId> {
}
