package unpsjb.labprog.backend.business.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.PacienteRepository;
import unpsjb.labprog.backend.model.Paciente;

@Service
public class PacienteService {

    @Autowired
    PacienteRepository repository;

    public List<Paciente> findAll() {
        List<Paciente> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Paciente findById(int id) {
        return repository.findById(id).orElse(null);
    }

    public Paciente save(Paciente paciente) {
        // Validaciones para evitar duplicados
        if (paciente.getId() == 0) {
            // 🚀 CREACIÓN
            if (repository.existsByDni(paciente.getDni())) {
                throw new IllegalStateException("Ya existe un paciente con el DNI: " + paciente.getDni());
            }
        } else {
            // 🛠️ MODIFICACIÓN
            Paciente existente = repository.findById(paciente.getId()).orElse(null);
            if (existente == null) {
                throw new IllegalStateException("No existe el paciente que se intenta modificar.");
            }

            // Verificar si el nuevo DNI ya está siendo usado por otro paciente
            if (!existente.getDni().equalsIgnoreCase(paciente.getDni()) &&
                repository.existsByDni(paciente.getDni())) {
                throw new IllegalStateException("Ya existe un paciente con el DNI: " + paciente.getDni());
            }
        }

        return repository.save(paciente);
    }

    public Page<Paciente> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
