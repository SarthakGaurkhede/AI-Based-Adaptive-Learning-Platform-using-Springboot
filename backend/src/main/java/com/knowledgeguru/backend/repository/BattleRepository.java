package com.knowledgeguru.backend.repository;

import com.knowledgeguru.backend.model.Battle;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BattleRepository extends MongoRepository<Battle, String> {
}
