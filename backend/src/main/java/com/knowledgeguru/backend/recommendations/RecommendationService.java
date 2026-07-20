package com.knowledgeguru.backend.recommendations;

import com.knowledgeguru.backend.model.KnowledgeGap;
import com.knowledgeguru.backend.model.Recommendation;
import com.knowledgeguru.backend.repository.KnowledgeGapRepository;
import com.knowledgeguru.backend.repository.RecommendationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/** Equivalent of the Node `recommendation.service.js`. */
@Service
public class RecommendationService {

    private final KnowledgeGapRepository knowledgeGapRepository;
    private final RecommendationRepository recommendationRepository;

    public List<Recommendation> generateForStudent(String studentId) {
        List<KnowledgeGap> gaps = knowledgeGapRepository
                .findByStudentIdAndStatusOrderByPriorityScoreDesc(studentId, "open")
                .stream().limit(5).toList();

        return gaps.stream().map(gap -> {
            Recommendation rec = recommendationRepository.findByStudentIdAndRefId(studentId, gap.getTopicId())
                    .orElseGet(Recommendation::new);
            rec.setStudentId(studentId);
            rec.setType("topic");
            rec.setRefId(gap.getTopicId());
            rec.setReason("Strengthen your understanding of this topic — detected as a " + gap.getSeverity() + " priority gap.");
            rec.setPriorityScore(gap.getPriorityScore());
            rec.setDismissed(false);
            rec.setGeneratedAt(Instant.now());
            return recommendationRepository.save(rec);
        }).toList();
    }
    public RecommendationService(KnowledgeGapRepository knowledgeGapRepository, RecommendationRepository recommendationRepository) {
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.recommendationRepository = recommendationRepository;
    }
}
