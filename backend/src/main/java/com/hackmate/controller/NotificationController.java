package com.hackmate.controller;

import com.hackmate.dto.CountResponse;
import com.hackmate.dto.NotificationDto;
import com.hackmate.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDto> getMine() {
        return notificationService.getMyNotifications();
    }

    @GetMapping("/unread-count")
    public CountResponse getUnreadCount() {
        return notificationService.getUnreadCount();
    }

    @PutMapping("/{id}/read")
    public NotificationDto markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }
}
