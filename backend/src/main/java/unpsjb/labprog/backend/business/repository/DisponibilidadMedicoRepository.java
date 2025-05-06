package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.DisponibilidadMedico;

@Repository
public interface DisponibilidadMedicoRepository extends JpaRepository<DisponibilidadMedico, Long> {
    // Puedes agregar métodos personalizados si es necesario
}