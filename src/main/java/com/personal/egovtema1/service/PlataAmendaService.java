package com.personal.egovtema1.service;

import com.personal.egovtema1.dto.request.PlataAmendaDTO;
import com.personal.egovtema1.entity.PlataAmenda;
import com.personal.egovtema1.mapper.PlataAmendaMapper;
import com.personal.egovtema1.repository.PlataAmendaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@AllArgsConstructor
public class PlataAmendaService {

    private final PlataAmendaRepository plataAmendaRepository;
    private final AmendaService amendaService;
    private final OrdinPlataService ordinPlataService;
    private final PlataAmendaMapper mapper;

    public PlataAmenda crearePlataAmenda(PlataAmendaDTO plataAmendaDTO) {
        try {
            PlataAmenda plataAmenda = mapDTOToEntity(plataAmendaDTO);
            ordinPlataService.genereazaOrdinXml(plataAmenda, calculeazaSumaPlatita(
                    amendaService.gasesteDupaProcesVerbal(plataAmenda.getNumarProcesVerbal())
                                 .getValoareAmenda(),
                    plataAmenda.getDataCompletarii()
            ));
            return plataAmendaRepository.save(plataAmenda);
        } catch (Exception e)
        {
            throw new RuntimeException("Eroare la generarea ordinului de plata XML: " + e.getMessage());
        }
    }

    private PlataAmenda mapDTOToEntity(PlataAmendaDTO plataAmendaDTO) {
        PlataAmenda plataAmenda = mapper.toEntity(plataAmendaDTO);
        plataAmenda.setId(UUID.randomUUID().toString());
        amendaService.gasesteDupaProcesVerbal(plataAmenda.getNumarProcesVerbal());
        plataAmenda.setDataCompletarii(LocalDateTime.now());
        return plataAmenda;
    }

    private Integer calculeazaSumaPlatita(Integer sumaAmenda, LocalDateTime dataCompletarii) {

        LocalDateTime acum = LocalDateTime.now();
        long zileDif = Duration.between(dataCompletarii, acum)
                               .toDays();

        if (zileDif <= 30) {
            return (int) Math.round(sumaAmenda / 2.0);
        } else {
            long luniIntarziere = (zileDif - 30) / 30;
            if (luniIntarziere < 0) {
                luniIntarziere = 0;
            }

            double procent = 1.0 * luniIntarziere;
            double sumaFinala = sumaAmenda * (1 + procent / 100.0);

            return (int) Math.round(sumaFinala);
        }
    }

}
