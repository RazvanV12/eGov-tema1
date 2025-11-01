package com.personal.egovtema1.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@AllArgsConstructor
@Getter
@Setter
@Builder
@NoArgsConstructor
public class AmendaDTO {
    @NotBlank(message = "Numărul de înmatriculare este obligatoriu")
    @Pattern(regexp = "^(?:[A-Z]{2}\\d{2}[A-Z]{3}|B\\d{2,3}[A-Z]{3})$",
            message = "Număr de înmatriculare invalid")
    private String nrInmatriculareMasina;

    @NotBlank(message = "Zona este obligatorie")
    private String zona;

    @NotBlank(message = "Codul agentului care a emis amenda este obligatoriu")
    private String codAgent;

    @NotNull(message = "Valoarea amenzii este obligatorie")
    @Positive(message = "Valoarea amenzii trebuie să fie un număr pozitiv")
    private int valoareAmenda;
}
