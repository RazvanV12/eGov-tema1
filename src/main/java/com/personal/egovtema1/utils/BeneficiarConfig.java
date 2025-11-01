package com.personal.egovtema1.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class BeneficiarConfig {

    @Value("${beneficiar.nume}")
    private String nume;

    @Value("${beneficiar.codFiscal}")
    private String codFiscal;

    @Value("${beneficiar.iban}")
    private String iban;

    @Value("${beneficiar.banca}")
    private String banca;

    public Beneficiar toBeneficiar() {
        return new Beneficiar(nume, codFiscal, iban, banca);
    }
}
