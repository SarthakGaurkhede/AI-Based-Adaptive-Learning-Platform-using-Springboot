package com.knowledgeguru.backend.knowledgegaps;

import com.knowledgeguru.backend.common.AppException;
import com.knowledgeguru.backend.model.KnowledgeGap;
import com.knowledgeguru.backend.model.Question;
import com.knowledgeguru.backend.model.QuizAttempt;
import com.knowledgeguru.backend.repository.KnowledgeGapRepository;
import com.knowledgeguru.backend.repository.QuestionRepository;
import com.knowledgeguru.backend.repository.QuizAttemptRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Equivalent of the Node `knowledge-gap.service.js`. */
@Service
public class KnowledgeGapService {

    private final KnowledgeGapRepository knowledgeGapRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuestionRepository questionRepository;

    private static class TopicAgg {
        int correct = 0;
        int total = 0;
        String courseId;
    }

    public void detectFromAttempt(String attemptId, String studentId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> AppException.notFound("Attempt not found"));

        List<Question> questions = questionRepository.findByIdIn(
                attempt.getAnswers().stream().map(QuizAttempt.AnswerEntry::getQuestionId).toList());
        Map<String, Question> questionMap = new HashMap<>();
        questions.forEach(q -> questionMap.put(q.getId(), q));

        Map<String, TopicAgg> topicMap = new HashMap<>();
        for (QuizAttempt.AnswerEntry ans : attempt.getAnswers()) {
            Question q = questionMap.get(ans.getQuestionId());
            if (q == null || q.getTopicId() == null) continue;
            TopicAgg agg = topicMap.computeIfAbsent(q.getTopicId(), k -> {
                TopicAgg a = new TopicAgg();
                a.courseId = q.getCourseId();
                return a;
            });
            agg.total++;
            if (ans.isCorrect()) agg.correct++;
        }

        for (Map.Entry<String, TopicAgg> entry : topicMap.entrySet()) {
            String topicId = entry.getKey();
            TopicAgg agg = entry.getValue();
            double score = agg.total > 0 ? (double) agg.correct / agg.total : 0;
            if (score >= 0.75) continue; // mastered

            String severity = score < 0.4 ? "high" : score < 0.6 ? "medium" : "low";
            double priorityScore = Math.round((1 - score) * 100);
            double confidenceScore = Math.round(score * 100);

            KnowledgeGap gap = knowledgeGapRepository.findByStudentIdAndTopicId(studentId, topicId).orElseGet(KnowledgeGap::new);
            gap.setStudentId(studentId);
            gap.setTopicId(topicId);
            gap.setCourseId(agg.courseId);
            gap.setSeverity(severity);
            gap.setPriorityScore(priorityScore);
            gap.setConfidenceScore(confidenceScore);
            gap.setSource("quiz_attempt");
            gap.setStatus("open");
            knowledgeGapRepository.save(gap);
        }
    }

    public List<KnowledgeGap> getStudentGaps(String studentId) {
        return knowledgeGapRepository.findByStudentIdAndStatusNotOrderByPriorityScoreDesc(studentId, "resolved");
    }

    public KnowledgeGap resolveGap(String gapId, String studentId) {
        KnowledgeGap gap = knowledgeGapRepository.findByIdAndStudentId(gapId, studentId)
                .orElseThrow(() -> AppException.notFound("Knowledge gap not found"));
        gap.setStatus("resolved");
        gap.setResolvedAt(Instant.now());
        return knowledgeGapRepository.save(gap);
    }
    public KnowledgeGapService(KnowledgeGapRepository knowledgeGapRepository, QuizAttemptRepository quizAttemptRepository, QuestionRepository questionRepository) {
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.questionRepository = questionRepository;
    }
}
