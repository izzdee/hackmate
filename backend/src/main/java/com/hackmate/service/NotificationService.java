package com.hackmate.service;

import com.hackmate.dto.CountResponse;
import com.hackmate.dto.NotificationDto;
import com.hackmate.entity.Notification;
import com.hackmate.entity.User;
import com.hackmate.exception.ForbiddenException;
import com.hackmate.exception.ResourceNotFoundException;
import com.hackmate.repository.NotificationRepository;
import com.hackmate.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SecurityUtils securityUtils;

    public NotificationService(NotificationRepository notificationRepository, SecurityUtils securityUtils) {
        this.notificationRepository = notificationRepository;
        this.securityUtils = securityUtils;
    }

    /** Called by other services (e.g. RequestService) to notify a user. */
    @Transactional
    public void notify(User recipient, String message) {
        Notification notification = Notification.builder()
                .user(recipient)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS))
                .build();
        notificationRepository.save(notification);
    }

    /** My notifications, newest first. */
    public List<NotificationDto> getMyNotifications() {
        User me = securityUtils.getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(me.getId()).stream()
                .map(NotificationDto::from)
                .toList();
    }

    public CountResponse getUnreadCount() {
        User me = securityUtils.getCurrentUser();
        return new CountResponse(notificationRepository.countByUserIdAndIsReadFalse(me.getId()));
    }

    @Transactional
    public NotificationDto markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id " + id));
        User me = securityUtils.getCurrentUser();
        if (!notification.getUser().getId().equals(me.getId())) {
            throw new ForbiddenException("This notification does not belong to you");
        }
        notification.setRead(true);
        return NotificationDto.from(notificationRepository.save(notification));
    }
}
