package project.TeamFive.ExLMS.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.notification.entity.Notification;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
}
