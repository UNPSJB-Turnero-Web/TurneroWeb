package unpsjb.labprog.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.annotation.JsonInclude;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Registrar el módulo JSR310 para el manejo de fechas LocalDate, LocalDateTime, etc.
        mapper.registerModule(new JavaTimeModule());
        
        // Configuración adicional para no incluir propiedades nulas
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        
        // Desactivar la escritura de fechas como timestamps
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return mapper;
    }
}