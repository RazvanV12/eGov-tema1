package com.personal.egovtema1.entity;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
@Document(collection = "plati_amenzi")
public class PlataAmenda {
    @Id
    private String id;

    @NotBlank(message = "Numele este obligatoriu")
    private String nume;

    @NotBlank(message = "Prenumele este obligatoriu")
    private String prenume;

    @NotBlank(message = "CNP/CUI este obligatoriu")
    @Pattern(regexp = "\\d{13}", message = "CNP trebuie să aibă 13 cifre")
    private String cnpSauCui;

    @Email(message = "Email invalid")
    private String email;

    private String adresaPostala;

    @Indexed(unique = true)
    private Integer numarProcesVerbal;

    @NotBlank(message = "IBAN-ul este obligatoriu")
    private String IBAN;

    @NotBlank(message = "Banca plătitorului (BIC) este obligatorie")
    private String bancaPlatitorului;

    private String descrierePlata;

    private LocalDateTime dataCompletarii;

}
