package com.lavadero.controller;

import com.lavadero.dto.ClientRequest;
import com.lavadero.dto.ClientResponse;
import com.lavadero.dto.VehicleDto;
import com.lavadero.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    public ResponseEntity<ClientResponse> createClient(@Valid @RequestBody ClientRequest request) {
        ClientResponse response = clientService.createClient(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ClientResponse>> getAllClients(Pageable pageable) {
        Page<ClientResponse> clients = clientService.getAllClients(pageable);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> getClientById(@PathVariable String id) {
        ClientResponse response = clientService.getClientById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> updateClient(
            @PathVariable String id,
            @Valid @RequestBody ClientRequest request
    ) {
        ClientResponse response = clientService.updateClient(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable String id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClientResponse>> searchClients(@RequestParam String term) {
        List<ClientResponse> clients = clientService.searchClientsByName(term);
        return ResponseEntity.ok(clients);
    }

    @PostMapping("/{id}/vehicles")
    public ResponseEntity<ClientResponse> addVehicle(
            @PathVariable String id,
            @Valid @RequestBody VehicleDto vehicle
    ) {
        ClientResponse response = clientService.addVehicle(id, vehicle);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/vehicles/{licensePlate}")
    public ResponseEntity<ClientResponse> removeVehicle(
            @PathVariable String id,
            @PathVariable String licensePlate
    ) {
        ClientResponse response = clientService.removeVehicle(id, licensePlate);
        return ResponseEntity.ok(response);
    }
}
