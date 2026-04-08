package com.lavadero.repository;

import com.lavadero.model.Client;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends MongoRepository<Client, String> {
    
    Optional<Client> findByEmail(String email);
    
    Optional<Client> findByDni(String dni);
    
    List<Client> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
        String firstName, String lastName
    );
    
    boolean existsByEmail(String email);
    
    boolean existsByDni(String dni);
}
