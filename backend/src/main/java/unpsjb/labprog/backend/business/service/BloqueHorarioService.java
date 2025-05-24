package unpsjb.labprog.backend.business.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.BloqueHorarioRepository;
import unpsjb.labprog.backend.model.BloqueHorario;

@Service
public class BloqueHorarioService {

    @Autowired
    private BloqueHorarioRepository repository;

    public List<BloqueHorario> findAll() {
        return (List<BloqueHorario>) repository.findAll();
    }

    public Optional<BloqueHorario> findById(Integer id) {
        return repository.findById(id);
    }

    public List<BloqueHorario> findByAgenda(Integer agendaId) {
        return repository.findByAgendaId(agendaId);
    }

    public BloqueHorario save(BloqueHorario bloque) {
        return repository.save(bloque);
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }

    public void deleteAll() {
        repository.deleteAll();
    }
}
