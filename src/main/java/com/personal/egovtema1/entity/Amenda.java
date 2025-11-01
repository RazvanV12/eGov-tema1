package com.personal.egovtema1.entity;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Document(collection = "amenzi")
public class Amenda {
    @Id
    private String id;

    @Indexed(unique = true)
    private Integer numarProcesVerbal;

    @Pattern(regexp = "^(?:[A-Z]{2}\\d{2}[A-Z]{3}|B\\d{2,3}[A-Z]{3})$", message = "Număr de înmatriculare invalid")
    private String nrInmatriculareMasina;

    private String zona;

    private LocalDateTime dataOra;

    private String codAgent;

    private Integer valoareAmenda;
}
