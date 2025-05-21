package unpsjb.labprog.backend.dto;

import java.util.HashSet;
import java.util.Set;

import lombok.Getter;
import lombok.Setter;
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Medico;

@Getter
@Setter
public class EspecialidadDTO {
    private int id;
    private String nombre;
    private String descripcion;
    private Set<CentroAtencion> centrosAtencion = new HashSet<>();
    private Set<Medico> medicos = new HashSet<>();

}