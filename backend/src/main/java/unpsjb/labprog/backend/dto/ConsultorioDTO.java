package unpsjb.labprog.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConsultorioDTO {
    private Long id;
    private int numero;
    private String nombre;
    private String centroAtencionNombre; // Solo el nombre del Centro de Atención
}