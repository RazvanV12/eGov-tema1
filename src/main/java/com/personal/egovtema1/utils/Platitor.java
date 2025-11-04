package com.personal.egovtema1.utils;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
@XmlAccessorType(XmlAccessType.FIELD)
public class Platitor {

    @XmlElement(name = "Nume")
    private String nume;

    @XmlElement(name = "Prenume")
    private String prenume;

    @XmlElement(name = "Tip Persoana")
    private String tipPersoana;

    @XmlElement(name = "CNP/CUI")
    private String cnpSauCui;

    @XmlElement(name = "IBAN")
    private String iban;

    @XmlElement(name = "Banca")
    private String banca;

    @XmlElement(name = "Adresa Postala")
    private String adresaPostala;

    @XmlElement(name = "Email")
    private String email;
}
