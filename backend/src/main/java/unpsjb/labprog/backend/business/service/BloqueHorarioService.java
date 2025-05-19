package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import unpsjb.labprog.backend.business.repository.BloqueHorarioRepository;
import unpsjb.labprog.backend.model.BloqueHorario;

import java.util.List;
import java.util.Optional;

@Service
public class BloqueHorarioService {

    @Autowired
    private BloqueHorarioRepository repository;

    public List<BloqueHorario> findAll() {
        return (List<BloqueHorario>) repository.findAll();
    }

    public Optional<BloqueHorario> findById(Long id) {
        return repository.findById(id);
    }

    public List<BloqueHorario> findByAgenda(Long agendaId) {
        return repository.findByAgendaId(agendaId);
    }

    public BloqueHorario save(BloqueHorario bloque) {
        return repository.save(bloque);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
