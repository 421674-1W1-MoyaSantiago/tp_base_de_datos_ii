package com.lavadero.service;

import com.lavadero.dto.ClientRequest;
import com.lavadero.dto.ClientResponse;
import com.lavadero.dto.VehicleDto;
import com.lavadero.model.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ClientService {
    ClientResponse createClient(ClientRequest request);
    ClientResponse updateClient(String id, ClientRequest request);
    void deleteClient(String id);
    ClientResponse getClientById(String id);
    Page<ClientResponse> getAllClients(Pageable pageable);
    List<ClientResponse> searchClientsByName(String searchTerm);
    ClientResponse addVehicle(String clientId, VehicleDto vehicle);
    ClientResponse removeVehicle(String clientId, String licensePlate);
}
