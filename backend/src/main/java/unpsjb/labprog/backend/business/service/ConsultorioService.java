package unpsjb.labprog.backend.business.service;

import java.util.List;

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

    public List<Consultorio> findByCentroAtencion(String centroNombre) {
        CentroAtencion centro = centroRepo.findByName(centroNombre);
        if (centro == null) {
            throw new IllegalStateException("Centro no encontrado");
        }
        return repository.findByCentroAtencion(centro);
    }

    @Transactional
    public Consultorio create(String centroNombre, int numero, String nombre) {
        CentroAtencion centro = centroRepo.findByName(centroNombre);
        if (centro == null) {
            throw new IllegalStateException("Centro no encontrado");
        }

        if (repository.existsByNumeroAndCentroAtencion(numero, centro)) {
            throw new IllegalStateException("El número de consultorio ya está registrado");
        }

        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalStateException("El nombre del consultorio es obligatorio");
        }

        if (repository.existsByNombreAndCentroAtencion(nombre, centro)) {
            throw new IllegalStateException("El nombre del consultorio ya está registrado");
        }

        Consultorio consultorio = new Consultorio();
        consultorio.setCentroAtencion(centro);
        consultorio.setNumero(numero);
        consultorio.setNombre(nombre);

        return repository.save(consultorio);
    }

    public Consultorio save(Consultorio consultorio) {
        return repository.save(consultorio);
    }
}
