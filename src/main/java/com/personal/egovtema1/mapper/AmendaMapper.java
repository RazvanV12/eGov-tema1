package com.personal.egovtema1.mapper;

import com.personal.egovtema1.dto.request.AmendaDTO;
import com.personal.egovtema1.entity.Amenda;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AmendaMapper {
    AmendaMapper INSTANCE = Mappers.getMapper(AmendaMapper.class);

    AmendaDTO toDto(Amenda entity);

    Amenda toEntity(AmendaDTO dto);
}
