package project.TeamFive.ExLMS.calendar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.calendar.entity.CalendarEvent;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {
    List<CalendarEvent> findByUserAndStartAtBetweenOrderByStartAtAsc(User user, LocalDateTime start, LocalDateTime end);
    List<CalendarEvent> findByUserOrderByStartAtAsc(User user);
    List<CalendarEvent> findBySourceEntityIdAndSourceEntityType(UUID sourceEntityId, CalendarEvent.SourceEntityType type);
    void deleteBySourceEntityIdAndSourceEntityType(UUID sourceEntityId, CalendarEvent.SourceEntityType type);
}
