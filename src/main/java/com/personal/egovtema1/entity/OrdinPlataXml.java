package com.personal.egovtema1.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Document(collection = "ordin_plata_xml")
public class OrdinPlataXml {
    @Id
    private String id;

    private Integer numarProcesVerbal;
    private String xmlContent;

}
