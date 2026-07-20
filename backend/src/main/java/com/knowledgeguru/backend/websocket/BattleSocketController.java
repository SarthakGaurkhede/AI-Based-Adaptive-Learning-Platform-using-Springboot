package com.knowledgeguru.backend.websocket;

import com.knowledgeguru.backend.model.Battle;
import com.knowledgeguru.backend.repository.BattleRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * STOMP equivalent of the Node `sockets/index.js` battle namespace. Clients subscribe to
 * /topic/battle/{battleId} and send to /app/battle/join|answer|complete.
 */
@Controller
public class BattleSocketController {

    private final BattleRepository battleRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/battle/join")
    public void join(Map<String, String> payload) {
        String battleId = payload.get("battleId");
        Battle battle = battleRepository.findById(battleId).orElse(null);
        if (battle == null) return;
        if ("waiting".equals(battle.getStatus()) && battle.getParticipants().size() >= 2) {
            battle.setStatus("active");
            battle.setStartedAt(Instant.now());
            battleRepository.save(battle);
            messagingTemplate.convertAndSend("/topic/battle/" + battleId,
                    Map.of("type", "battle:start", "questionIds", battle.getQuestionIds()));
        }
    }

    @MessageMapping("/battle/answer")
    public void answer(Map<String, Object> payload) {
        String battleId = (String) payload.get("battleId");
        String userId = (String) payload.get("userId");
        Battle battle = battleRepository.findById(battleId).orElse(null);
        if (battle == null) return;
        battle.getScores().stream().filter(s -> s.getUserId().equals(userId)).findFirst()
                .ifPresent(s -> s.setScore(s.getScore() + 1));
        battleRepository.save(battle);
        messagingTemplate.convertAndSend("/topic/battle/" + battleId,
                Map.of("type", "battle:score_update", "scores", battle.getScores()));
        messagingTemplate.convertAndSend("/topic/battle/" + battleId, Map.of("type", "battle:opponent_answered"));
    }

    @MessageMapping("/battle/complete")
    public void complete(Map<String, String> payload) {
        String battleId = payload.get("battleId");
        String winnerId = payload.get("winnerId");
        Battle battle = battleRepository.findById(battleId).orElse(null);
        if (battle == null) return;
        battle.setStatus("completed");
        battle.setWinnerId(winnerId);
        battle.setCompletedAt(Instant.now());
        battleRepository.save(battle);
        messagingTemplate.convertAndSend("/topic/battle/" + battleId, Map.of("type", "battle:ended", "winnerId", winnerId));
    }
    public BattleSocketController(BattleRepository battleRepository, SimpMessagingTemplate messagingTemplate) {
        this.battleRepository = battleRepository;
        this.messagingTemplate = messagingTemplate;
    }
}
