package com.knowledgeguru.backend.websocket;

import com.knowledgeguru.backend.model.Notification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/** Pushes real-time events to connected clients — replaces the Node `sockets/index.js` emitters. */
@Component
public class NotificationPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void pushNotification(String userId, Notification notification) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
    }

    public void pushLeaderboardUpdate(List<Map<String, Object>> topRows) {
        messagingTemplate.convertAndSend("/topic/leaderboard", topRows);
    }

    public void pushXpUpdate(String userId, Map<String, Object> xpEvent) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/xp", xpEvent);
    }
    public NotificationPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
}
