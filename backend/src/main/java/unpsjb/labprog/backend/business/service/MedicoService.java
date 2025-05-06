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

    public Medico findById(int id) {
        return repository.findById(id).orElse(null);
    }

    public Medico save(Medico medico) {
        return repository.save(medico);
    }

    public Page<Medico> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
