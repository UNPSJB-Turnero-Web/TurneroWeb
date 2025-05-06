package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.model.ObraSocial;
import unpsjb.labprog.backend.business.repository.ObraSocialRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ObraSocialService {

    @Autowired
    private ObraSocialRepository repository;

    public List<ObraSocial> findAll() {
        List<ObraSocial> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Optional<ObraSocial> findById(Integer id) {
        return repository.findById(id);
    }

    public ObraSocial save(ObraSocial obraSocial) {
        return repository.save(obraSocial);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}