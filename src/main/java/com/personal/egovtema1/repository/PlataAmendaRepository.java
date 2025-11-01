package com.personal.egovtema1.repository;

import com.personal.egovtema1.entity.PlataAmenda;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PlataAmendaRepository extends MongoRepository<PlataAmenda, String> {
    Optional<PlataAmenda> findByNumarProcesVerbal(String numarProcesVerbal);
}
