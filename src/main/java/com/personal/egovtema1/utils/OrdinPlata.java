package com.personal.egovtema1.utils;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@XmlRootElement(name = "OrdinPlata")
@XmlAccessorType(XmlAccessType.FIELD)
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class OrdinPlata {

    @XmlElement(name = "Numar Ordin")
    private Integer numarOrdin;

    @XmlElement(name = "Data Emiterii")
    private String dataEmiterii;

    @XmlElement(name = "Platitor")
    private Platitor platitor;

    @XmlElement(name = "Beneficiar")
    private Beneficiar beneficiar;

    @XmlElement(name = "Suma")
    private Integer suma;

    @XmlElement(name = "Destinatia Platii")
    private String destinatiaPlatii;
}
