package com.lavadero.service.impl;

import com.lavadero.dto.ClientRequest;
import com.lavadero.dto.ClientResponse;
import com.lavadero.dto.VehicleDto;
import com.lavadero.exception.DuplicateResourceException;
import com.lavadero.exception.ResourceNotFoundException;
import com.lavadero.model.Client;
import com.lavadero.model.Vehicle;
import com.lavadero.repository.ClientRepository;
import com.lavadero.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;

    @Override
    public ClientResponse createClient(ClientRequest request) {
        if (clientRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already exists: " + request.email());
        }
        if (clientRepository.existsByDni(request.dni())) {
            throw new DuplicateResourceException("DNI already exists: " + request.dni());
        }

        Client client = mapToEntity(request);
        Client savedClient = clientRepository.save(client);
        return mapToResponse(savedClient);
    }

    @Override
    public ClientResponse updateClient(String id, ClientRequest request) {
        Client existingClient = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        // Check for duplicate email/dni if changed
        if (!existingClient.getEmail().equals(request.email()) && 
            clientRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already exists: " + request.email());
        }
        if (!existingClient.getDni().equals(request.dni()) && 
            clientRepository.existsByDni(request.dni())) {
            throw new DuplicateResourceException("DNI already exists: " + request.dni());
        }

        existingClient.setFirstName(request.firstName());
        existingClient.setLastName(request.lastName());
        existingClient.setEmail(request.email());
        existingClient.setPhone(request.phone());
        existingClient.setDni(request.dni());
        
        if (request.vehicles() != null) {
            existingClient.setVehicles(request.vehicles().stream()
                    .map(this::mapToVehicle)
                    .collect(Collectors.toList()));
        }

        Client updatedClient = clientRepository.save(existingClient);
        return mapToResponse(updatedClient);
    }

    @Override
    public void deleteClient(String id) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Client not found with id: " + id);
        }
        clientRepository.deleteById(id);
    }

    @Override
    public ClientResponse getClientById(String id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        return mapToResponse(client);
    }

    @Override
    public Page<ClientResponse> getAllClients(Pageable pageable) {
        return clientRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public List<ClientResponse> searchClientsByName(String searchTerm) {
        return clientRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(searchTerm, searchTerm)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ClientResponse addVehicle(String clientId, VehicleDto vehicle) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));

        // Check if vehicle with same license plate already exists
        boolean vehicleExists = client.getVehicles().stream()
                .anyMatch(v -> v.getLicensePlate().equalsIgnoreCase(vehicle.licensePlate()));
        
        if (vehicleExists) {
            throw new DuplicateResourceException("Vehicle with license plate already exists: " + vehicle.licensePlate());
        }

        client.getVehicles().add(mapToVehicle(vehicle));
        Client updatedClient = clientRepository.save(client);
        return mapToResponse(updatedClient);
    }

    @Override
    public ClientResponse removeVehicle(String clientId, String licensePlate) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));

        boolean removed = client.getVehicles().removeIf(v -> 
            v.getLicensePlate().equalsIgnoreCase(licensePlate)
        );

        if (!removed) {
            throw new ResourceNotFoundException("Vehicle not found with license plate: " + licensePlate);
        }

        Client updatedClient = clientRepository.save(client);
        return mapToResponse(updatedClient);
    }

    private Client mapToEntity(ClientRequest request) {
        Client client = new Client();
        client.setFirstName(request.firstName());
        client.setLastName(request.lastName());
        client.setEmail(request.email());
        client.setPhone(request.phone());
        client.setDni(request.dni());
        
        if (request.vehicles() != null) {
            client.setVehicles(request.vehicles().stream()
                    .map(this::mapToVehicle)
                    .collect(Collectors.toList()));
        }
        
        return client;
    }

    private Vehicle mapToVehicle(VehicleDto dto) {
        return new Vehicle(
                dto.licensePlate(),
                dto.brand(),
                dto.model(),
                dto.year(),
                dto.color()
        );
    }

    private VehicleDto mapToVehicleDto(Vehicle vehicle) {
        return new VehicleDto(
                vehicle.getLicensePlate(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getColor()
        );
    }

    private ClientResponse mapToResponse(Client client) {
        List<VehicleDto> vehicleDtos = client.getVehicles() != null
                ? client.getVehicles().stream()
                        .map(this::mapToVehicleDto)
                        .collect(Collectors.toList())
                : List.of();

        return new ClientResponse(
                client.getId(),
                client.getFirstName(),
                client.getLastName(),
                client.getEmail(),
                client.getPhone(),
                client.getDni(),
                vehicleDtos,
                client.getCreatedAt(),
                client.getUpdatedAt()
        );
    }
}
