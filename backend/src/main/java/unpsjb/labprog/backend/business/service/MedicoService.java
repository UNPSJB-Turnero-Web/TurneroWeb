package unpsjb.labprog.backend.business.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.MedicoRepository;
import unpsjb.labprog.backend.model.Medico;

@Service
public class MedicoService {

    @Autowired
    MedicoRepository repository;

    public List<Medico> findAll() {
        List<Medico> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Medico findById(Long id) { // Mantener como Integer
        return repository.findById(id).orElse(null);
    }

    public Medico save(Medico medico) {
        if (medico.getId() == 0) {
            if (repository.existsByMatricula(medico.getMatricula())) {
                throw new IllegalStateException("Ya existe un médico con la matrícula: " + medico.getMatricula());
            }
        } else {
            Medico existente = repository.findById(medico.getId()).orElse(null); // Asegúrate de que el id sea Integer
            if (existente == null) {
                throw new IllegalStateException("No existe el médico que se intenta modificar.");
            }

            if (!existente.getMatricula().equalsIgnoreCase(medico.getMatricula()) &&
                repository.existsByMatricula(medico.getMatricula())) {
                throw new IllegalStateException("Ya existe un médico con la matrícula: " + medico.getMatricula());
            }
        }

        return repository.save(medico);
    }

    public Page<Medico> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    public void delete(Long id) { // Mantener como Integer
        repository.deleteById(id);
    }
}
