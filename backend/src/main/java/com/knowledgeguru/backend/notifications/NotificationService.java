package com.knowledgeguru.backend.notifications;

import com.knowledgeguru.backend.model.Notification;
import com.knowledgeguru.backend.repository.NotificationRepository;
import com.knowledgeguru.backend.websocket.NotificationPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/** Equivalent of the Node `notification.service.js`, plus a real-time push via STOMP. */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPublisher notificationPublisher;

    public Notification create(String userId, String type, String title, String body, String link, String priority) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);
        n.setLink(link);
        n.setPriority(priority == null ? "normal" : priority);
        n = notificationRepository.save(n);
        notificationPublisher.pushNotification(userId, n);
        return n;
    }

    public Map<String, Object> getForUser(String userId, int page, int limit) {
        Page<Notification> result = notificationRepository.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(Math.max(page - 1, 0), limit, Sort.by(Sort.Direction.DESC, "createdAt")));
        long unread = notificationRepository.countByUserIdAndReadFalse(userId);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("total", result.getTotalElements());
        meta.put("page", page);
        meta.put("pages", result.getTotalPages());
        meta.put("unread", unread);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("data", result.getContent());
        out.put("meta", meta);
        return out;
    }

    public Notification markRead(String notificationId, String userId) {
        return notificationRepository.findByIdAndUserId(notificationId, userId).map(n -> {
            n.setRead(true);
            return notificationRepository.save(n);
        }).orElse(null);
    }

    public void markAllRead(String userId) {
        var unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
    public NotificationService(NotificationRepository notificationRepository, NotificationPublisher notificationPublisher) {
        this.notificationRepository = notificationRepository;
        this.notificationPublisher = notificationPublisher;
    }
}
