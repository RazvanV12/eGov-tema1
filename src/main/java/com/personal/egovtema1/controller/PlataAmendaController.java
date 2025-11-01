package com.personal.egovtema1.controller;

import com.personal.egovtema1.dto.request.PlataAmendaDTO;
import com.personal.egovtema1.entity.PlataAmenda;
import com.personal.egovtema1.service.PlataAmendaService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/plati")
@Validated
public class PlataAmendaController {
    private final PlataAmendaService plataService;

    public PlataAmendaController(PlataAmendaService plataService) {
        this.plataService = plataService;
    }

    @PostMapping
    public ResponseEntity<PlataAmenda> trimitePlata(@Valid @RequestBody PlataAmendaDTO plataAmendaDTO) {
        return ResponseEntity.ok(plataService.crearePlataAmenda(plataAmendaDTO));
    }
}
