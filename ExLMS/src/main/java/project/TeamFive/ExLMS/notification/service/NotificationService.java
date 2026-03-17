package project.TeamFive.ExLMS.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.notification.dto.response.NotificationResponseDTO;
import project.TeamFive.ExLMS.notification.entity.Notification;
import project.TeamFive.ExLMS.notification.repository.NotificationRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationResponseDTO> getNotificationsForUser(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .map(NotificationResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(UUID id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void createNotification(User recipient, String title, String body, Notification.NotificationType type, String actionUrl, UUID sourceEntityId, String sourceEntityType) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .body(body)
                .type(type)
                .actionUrl(actionUrl)
                .sourceEntityId(sourceEntityId)
                .sourceEntityType(sourceEntityType)
                .build();
        notificationRepository.save(notification);
    }
}
