package com.personal.egovtema1.utils;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@XmlRootElement(name = "Beneficiar")
@XmlAccessorType(XmlAccessType.FIELD)
public class Beneficiar {
    @XmlElement(name = "Nume")
    private String nume;

    @XmlElement(name = "Cod Fiscal")
    private String codFiscal;

    @XmlElement(name = "IBAN")
    private String iban;

    @XmlElement(name = "Banca")
    private String banca;
}
