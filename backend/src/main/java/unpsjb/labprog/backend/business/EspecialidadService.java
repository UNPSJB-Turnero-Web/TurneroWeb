package unpsjb.labprog.backend.business;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.model.Especialidad;

@Service
public class EspecialidadService {

    @Autowired
    EspecialidadRepository repository;

    public List<Especialidad> findAll() {
        List<Especialidad> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Especialidad findById(int id) {
        return repository.findById(id).orElse(null);
    }

    public Especialidad save(Especialidad especialidad) {
        return repository.save(especialidad);
    }

    public Page<Especialidad> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
