package unpsjb.labprog.backend.business.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.model.Turno;

@Service
public class TurnoService {

    @Autowired
    TurnoRepository repository;

    public List<Turno> findAll() {
        List<Turno> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Turno findById(int id) {
        return repository.findById(id).orElse(null);
    }

    public Turno save(Turno turno) {
        return repository.save(turno);
    }

    public Page<Turno> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
