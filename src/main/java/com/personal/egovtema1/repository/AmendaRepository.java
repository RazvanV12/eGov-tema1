package com.personal.egovtema1.repository;

import com.personal.egovtema1.entity.Amenda;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AmendaRepository extends MongoRepository<Amenda, String> {
    Optional<Amenda> findByNumarProcesVerbal(Integer numarProcesVerbal);

    Optional<Amenda> findTopByOrderByNumarProcesVerbalDesc();
}
