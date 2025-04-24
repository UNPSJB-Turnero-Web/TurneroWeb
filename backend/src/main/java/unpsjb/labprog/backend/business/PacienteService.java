package unpsjb.labprog.backend.business;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

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
        return repository.save(paciente);
    }

    public Page<Paciente> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
