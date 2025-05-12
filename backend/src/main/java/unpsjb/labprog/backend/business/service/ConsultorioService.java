package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.CentroAtencionRepository;
import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Consultorio;

@Service
public class ConsultorioService {

    @Autowired
    private ConsultorioRepository repository;

    @Autowired
    private CentroAtencionRepository centroRepo;

    public List<Consultorio> findAll() {
        return (List<Consultorio>) repository.findAll();
    }

    public Optional<Consultorio> findById(int id) {
        return repository.findById(id);
    }

    public List<Consultorio> findByCentroAtencion(String centroNombre) {
        CentroAtencion centro = centroRepo.findByName(centroNombre);
        if (centro == null) {
            throw new IllegalStateException("Centro no encontrado");
        }
        return repository.findByCentroAtencion(centro);
    }

    @Transactional
    public Consultorio save(Consultorio consultorio) {
        CentroAtencion centro = centroRepo.findById(consultorio.getCentroAtencion().getId())
                .orElseThrow(() -> new IllegalStateException("Centro de Atención no encontrado"));

        if (consultorio.getId() == 0) {
            // Validaciones para creación
            if (repository.existsByNumeroAndCentroAtencion(consultorio.getNumero(), centro)) {
                throw new IllegalStateException("El número de consultorio ya está registrado");
            }
            if (repository.existsByNombreAndCentroAtencion(consultorio.getNombre(), centro)) {
                throw new IllegalStateException("El nombre del consultorio ya está registrado");
            }
        } else {
            // Validaciones para actualización
            Consultorio existente = repository.findById(consultorio.getId())
                    .orElseThrow(() -> new IllegalStateException("Consultorio no encontrado"));
            if (!existente.getCentroAtencion().equals(centro)) {
                throw new IllegalStateException("No se puede cambiar el Centro de Atención del consultorio");
            }
        }

        consultorio.setCentroAtencion(centro);
        return repository.save(consultorio);
    }

    @Transactional
    public void delete(int id) {
        repository.deleteById(id);
    }
}
