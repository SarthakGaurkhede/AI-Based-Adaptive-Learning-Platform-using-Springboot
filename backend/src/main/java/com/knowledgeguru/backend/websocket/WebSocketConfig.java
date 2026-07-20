package com.knowledgeguru.backend.websocket;

import com.knowledgeguru.backend.config.AppProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Real-time transport, replacing the Node backend's Socket.IO usage. Clients connect over
 * SockJS/STOMP at /ws, subscribe to /topic/leaderboard and /user/queue/notifications,
 * and the server pushes updates via SimpMessagingTemplate (see NotificationPublisher).
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final AppProperties appProperties;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(appProperties.getClientUrl())
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }
    public WebSocketConfig(AppProperties appProperties) {
        this.appProperties = appProperties;
    }
}
