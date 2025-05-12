package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class ConsultorioDTO {
  private Long   id;
  private int    numero;
  private String name;
  private CentroAtencionDTO centroAtencion;
}
