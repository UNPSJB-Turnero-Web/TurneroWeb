package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.model.EsquemaTurno;

import java.util.List;
import java.util.Optional;

@Service
public class EsquemaTurnoService {

    @Autowired
    private EsquemaTurnoRepository repository;

    public List<EsquemaTurno> findAll() {
        return repository.findAll();
    }

    public Optional<EsquemaTurno> findById(Long id) {
        return repository.findById(id);
    }

    public EsquemaTurno save(EsquemaTurno esquemaTurno) {
        return repository.save(esquemaTurno);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}