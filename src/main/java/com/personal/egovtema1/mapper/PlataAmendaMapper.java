package com.personal.egovtema1.mapper;

import com.personal.egovtema1.dto.request.PlataAmendaDTO;
import com.personal.egovtema1.entity.PlataAmenda;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface PlataAmendaMapper {
    PlataAmenda INSTANCE = Mappers.getMapper(PlataAmenda.class);

    PlataAmendaDTO toDto(PlataAmenda entity);

    PlataAmenda toEntity(PlataAmendaDTO dto);
}
