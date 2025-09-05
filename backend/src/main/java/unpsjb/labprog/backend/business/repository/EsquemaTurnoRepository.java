package unpsjb.labprog.backend.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.EsquemaTurno;

@Repository
public interface EsquemaTurnoRepository extends JpaRepository<EsquemaTurno, Integer> {

    List<EsquemaTurno> findByStaffMedicoId(Integer staffMedicoId);
    
    List<EsquemaTurno> findByConsultorioId(Integer consultorioId);
    
    List<EsquemaTurno> findByCentroAtencionId(Integer centroAtencionId);
    
    /**
     * Encuentra esquemas de turno para una especialidad y centro específicos
     */
    List<EsquemaTurno> findByStaffMedico_Especialidad_IdAndCentroAtencion_Id(Integer especialidadId, Integer centroId);

}