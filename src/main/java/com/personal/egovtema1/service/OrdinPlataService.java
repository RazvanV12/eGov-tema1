package com.personal.egovtema1.service;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.personal.egovtema1.entity.OrdinPlataXml;
import com.personal.egovtema1.entity.PlataAmenda;
import com.personal.egovtema1.repository.OrdinPlataXmlRepository;
import com.personal.egovtema1.utils.BeneficiarConfig;
import com.personal.egovtema1.utils.OrdinPlata;
import com.personal.egovtema1.utils.Platitor;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;


@Service
@AllArgsConstructor
public class OrdinPlataService {

    private final BeneficiarConfig beneficiarConfig;
    private final OrdinPlataXmlRepository ordinPlataXmlRepository;

    public void genereazaOrdinXml(PlataAmenda plataAmenda, Integer suma) throws Exception {
        OrdinPlata ordin = new OrdinPlata();
        ordin.setNumarOrdin(plataAmenda.getNumarProcesVerbal());
        ordin.setDataEmiterii(plataAmenda.getDataCompletarii().toString());

        ordin.setPlatitor(Platitor.builder()
                .nume(plataAmenda.getNume())
                .prenume(plataAmenda.getPrenume())
                .cnpSauCui(plataAmenda.getCnpSauCui())
                .iban(plataAmenda.getIBAN())
                .banca(plataAmenda.getBancaPlatitorului())
                .adresaPostala(plataAmenda.getAdresaPostala())
                .email(plataAmenda.getEmail())
                .build());

        ordin.setBeneficiar(beneficiarConfig.toBeneficiar());

        ordin.setSuma(suma);
        ordin.setDestinatiaPlatii("Plata contraventiei prin parcare necorespunzatoare – PV nr. PV%s".formatted(plataAmenda.getNumarProcesVerbal()));

        XmlMapper xmlMapper = new XmlMapper();

        ordinPlataXmlRepository.save(new OrdinPlataXml(
                UUID.randomUUID().toString(),
                ordin.getNumarOrdin(),
                xmlMapper.writeValueAsString(ordin)
        ));
    }
}
