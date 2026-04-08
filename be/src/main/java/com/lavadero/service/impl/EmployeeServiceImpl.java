package com.lavadero.service.impl;

import com.lavadero.dto.EmployeeRequest;
import com.lavadero.dto.EmployeeResponse;
import com.lavadero.exception.DuplicateResourceException;
import com.lavadero.exception.ResourceNotFoundException;
import com.lavadero.model.Employee;
import com.lavadero.model.EmployeeRole;
import com.lavadero.repository.EmployeeRepository;
import com.lavadero.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username already exists: " + request.username());
        }

        Employee employee = new Employee();
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());
        employee.setPhone(request.phone());
        employee.setRole(request.role());
        employee.setUsername(request.username());
        employee.setPassword(passwordEncoder.encode(request.password()));
        employee.setActive(true);

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToResponse(savedEmployee);
    }

    @Override
    public EmployeeResponse updateEmployee(String id, EmployeeRequest request) {
        Employee existingEmployee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (!existingEmployee.getUsername().equals(request.username()) && 
            employeeRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username already exists: " + request.username());
        }

        existingEmployee.setFirstName(request.firstName());
        existingEmployee.setLastName(request.lastName());
        existingEmployee.setEmail(request.email());
        existingEmployee.setPhone(request.phone());
        existingEmployee.setRole(request.role());
        existingEmployee.setUsername(request.username());
        
        if (request.password() != null && !request.password().isBlank()) {
            existingEmployee.setPassword(passwordEncoder.encode(request.password()));
        }

        Employee updatedEmployee = employeeRepository.save(existingEmployee);
        return mapToResponse(updatedEmployee);
    }

    @Override
    public void deleteEmployee(String id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }

    @Override
    public EmployeeResponse getEmployeeById(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToResponse(employee);
    }

    @Override
    public Page<EmployeeResponse> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public List<EmployeeResponse> getActiveEmployees() {
        return employeeRepository.findByActive(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EmployeeResponse> getEmployeesByRole(EmployeeRole role) {
        return employeeRepository.findByActiveAndRole(true, role).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeResponse toggleEmployeeStatus(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        
        employee.setActive(!employee.getActive());
        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToResponse(updatedEmployee);
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getRole(),
                employee.getUsername(),
                employee.getActive(),
                employee.getCreatedAt()
        );
    }
}
