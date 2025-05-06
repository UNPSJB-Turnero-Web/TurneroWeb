package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.DisponibilidadMedicoRepository;
import unpsjb.labprog.backend.model.DisponibilidadMedico;

import java.util.List;
import java.util.Optional;

@Service
public class DisponibilidadMedicoService {

    @Autowired
    private DisponibilidadMedicoRepository repository;

    public List<DisponibilidadMedico> findAll() {
        return repository.findAll();
    }

    public Optional<DisponibilidadMedico> findById(Long id) {
        return repository.findById(id);
    }

    public DisponibilidadMedico save(DisponibilidadMedico disponibilidadMedico) {
        return repository.save(disponibilidadMedico);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}