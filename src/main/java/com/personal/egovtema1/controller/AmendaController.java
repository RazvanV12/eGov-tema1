package com.personal.egovtema1.controller;

import com.personal.egovtema1.dto.request.AmendaDTO;
import com.personal.egovtema1.entity.Amenda;
import com.personal.egovtema1.service.AmendaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/amenzi")
public class AmendaController {
    private final AmendaService amendaService;

    public AmendaController(AmendaService amendaService) {
        this.amendaService = amendaService;
    }

    @PostMapping
    public ResponseEntity<?> creeazaAmenda(@Valid @RequestBody AmendaDTO amendaDTO) {
        return ResponseEntity.ok(amendaService.creeazaAmenda(amendaDTO));
    }
}
