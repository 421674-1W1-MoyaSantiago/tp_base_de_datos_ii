package com.lavadero.service;

import com.lavadero.dto.EmployeeRequest;
import com.lavadero.dto.EmployeeResponse;
import com.lavadero.model.EmployeeRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {
    EmployeeResponse createEmployee(EmployeeRequest request);
    EmployeeResponse updateEmployee(String id, EmployeeRequest request);
    void deleteEmployee(String id);
    EmployeeResponse getEmployeeById(String id);
    Page<EmployeeResponse> getAllEmployees(Pageable pageable);
    List<EmployeeResponse> getActiveEmployees();
    List<EmployeeResponse> getEmployeesByRole(EmployeeRole role);
    EmployeeResponse toggleEmployeeStatus(String id);
}
