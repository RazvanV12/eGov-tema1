package com.personal.egovtema1.dto.request;


import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
@Setter
@Builder
@NoArgsConstructor
public class PlataAmendaDTO {

    private String tipPersoana;

    @NotBlank(message = "Numele este obligatoriu")
    private String nume;

    @NotBlank(message = "Prenumele este obligatoriu")
    private String prenume;

    @NotBlank(message = "CNP/CUI este obligatoriu")
    private String cnpSauCui;

    @Email(message = "Email invalid")
    private String email;

    @NotBlank(message = "Adresa poștală este obligatorie")
    private String adresaPostala;

    @JsonProperty("IBAN")
    @NotBlank(message = "IBAN-ul este obligatoriu")
    private String IBAN;

    @NotBlank(message = "Banca plătitorului (BIC) este obligatorie")
    private String bancaPlatitorului;

    @Positive(message = "Numărul procesului verbal trebuie să fie un număr pozitiv")
    private Integer numarProcesVerbal;

    private String descrierePlata;
}
