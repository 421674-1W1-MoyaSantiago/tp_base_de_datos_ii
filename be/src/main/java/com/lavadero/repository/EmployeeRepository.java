package com.lavadero.repository;

import com.lavadero.model.Employee;
import com.lavadero.model.EmployeeRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    
    Optional<Employee> findByUsername(String username);
    
    List<Employee> findByActive(Boolean active);
    
    List<Employee> findByRole(EmployeeRole role);
    
    List<Employee> findByActiveAndRole(Boolean active, EmployeeRole role);
    
    boolean existsByUsername(String username);
}
