package com.personal.egovtema1.service;

import com.personal.egovtema1.dto.request.AmendaDTO;
import com.personal.egovtema1.entity.Amenda;
import com.personal.egovtema1.mapper.AmendaMapper;
import com.personal.egovtema1.repository.AmendaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AmendaService {

    private final AmendaRepository amendaRepository;
    private final AmendaMapper mapper;

    public Amenda creeazaAmenda(AmendaDTO amendaDTO) {
        Amenda amenda = mapEntityToDTO(amendaDTO);
        return amendaRepository.save(amenda);
    }

    public Amenda gasesteDupaProcesVerbal(Integer numarPV) {
        return amendaRepository.findByNumarProcesVerbal(numarPV)
                               .orElseThrow(() -> new RuntimeException("Amenda nu exista pentru PV: " + numarPV));
    }

    private Amenda mapEntityToDTO(AmendaDTO amendaDTO) {
        Amenda amenda = mapper.toEntity(amendaDTO);

        Integer maxNumarProcesVerbal = amendaRepository.findTopByOrderByNumarProcesVerbalDesc()
                                     .map(Amenda::getNumarProcesVerbal)
                                     .orElse(0);
        amenda.setNumarProcesVerbal(maxNumarProcesVerbal + 1);

        amenda.setDataOra(LocalDateTime.now());
        amenda.setId(UUID.randomUUID().toString());

        return amenda;
    }
}
