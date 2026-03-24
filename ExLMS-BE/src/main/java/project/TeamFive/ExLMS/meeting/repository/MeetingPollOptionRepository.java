package project.TeamFive.ExLMS.meeting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.meeting.entity.MeetingPollOption;

import java.util.UUID;

@Repository
public interface MeetingPollOptionRepository extends JpaRepository<MeetingPollOption, UUID> {
}
