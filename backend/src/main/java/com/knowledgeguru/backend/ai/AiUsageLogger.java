package com.knowledgeguru.backend.ai;

import com.knowledgeguru.backend.model.AiUsage;
import com.knowledgeguru.backend.repository.AiUsageRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/** Equivalent of the Node `utils/ai-usage-logger.js` — fire-and-forget usage tracking for the admin cost dashboard. */
@Service
public class AiUsageLogger {

    private final AiUsageRepository aiUsageRepository;

    @Async
    public void log(String userId, String module, String status) {
        AiUsage usage = new AiUsage();
        usage.setUserId(userId);
        usage.setModule(module);
        usage.setStatus(status);
        aiUsageRepository.save(usage);
    }
    public AiUsageLogger(AiUsageRepository aiUsageRepository) {
        this.aiUsageRepository = aiUsageRepository;
    }
}
