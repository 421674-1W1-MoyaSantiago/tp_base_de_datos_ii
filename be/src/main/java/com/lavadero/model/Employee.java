package com.lavadero.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    
    @Id
    private String id;
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @Email(message = "Email should be valid")
    private String email;
    
    private String phone;
    
    @NotNull(message = "Role is required")
    private EmployeeRole role;
    
    @NotBlank(message = "Username is required")
    @Indexed(unique = true)
    private String username;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    private Boolean active = true;
    
    @CreatedDate
    private LocalDateTime createdAt;
}
