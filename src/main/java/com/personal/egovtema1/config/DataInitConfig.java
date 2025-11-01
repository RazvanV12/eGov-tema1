package com.personal.egovtema1.config;

import com.personal.egovtema1.dto.request.PlataAmendaDTO;
import com.personal.egovtema1.entity.Amenda;
import com.personal.egovtema1.entity.PlataAmenda;
import com.personal.egovtema1.repository.AmendaRepository;
import com.personal.egovtema1.repository.PlataAmendaRepository;
import com.personal.egovtema1.service.PlataAmendaService;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.time.LocalDateTime;

@Configuration
@AllArgsConstructor
public class DataInitConfig {

    private final PlataAmendaService plataAmendaService;

    @Bean
    @Order(1)
    public CommandLineRunner clearCollections(MongoTemplate mongoTemplate) {
        return args -> {
            mongoTemplate.dropCollection("amenzi");
            mongoTemplate.dropCollection("plati_amenzi");
        };
    }

    @Bean
    @Order(2)
    public CommandLineRunner initData(AmendaRepository amendaRepository,
                                      PlataAmendaRepository plataAmendaRepository) {
        return args -> {

            // Creează o amenda de test
            Amenda am = new Amenda();
            am.setNumarProcesVerbal(12345);
            am.setNrInmatriculareMasina("B12ABC");
            am.setZona("Zona Politehnica");
            am.setDataOra(LocalDateTime.now());
            am.setCodAgent("Agent-Ion");
            am.setValoareAmenda(200);
            amendaRepository.save(am);

            // NU mai creăm PlataAmenda manual - service-ul o creează automat
            // Creează doar prin service pentru a evita duplicatele
            // (service-ul generează și ordinul XML)
            try {
                plataAmendaService.crearePlataAmenda(PlataAmendaDTO.builder()
                        .nume("Popescu")
                        .prenume("Ion")
                        .cnpSauCui("1234567890123")
                        .email("ion.popescu@example.com")
                        .adresaPostala("Strada Exemplu 1, Bucuresti")
                        .descrierePlata("Plata contraventiei parcare")
                        .IBAN("RO49AAAA1B31007593840000")
                        .numarProcesVerbal(12345)
                        .bancaPlatitorului("Banca Exemplu S.A.")
                        .build());
            } catch (Exception e) {
                // Ignoră erori dacă deja există
                System.out.println("Amenda de test deja există sau eroare: " + e.getMessage());
            }
        };
    }
}
