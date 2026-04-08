package com.lavadero.service;

import com.lavadero.dto.ClientRequest;
import com.lavadero.dto.ClientResponse;
import com.lavadero.dto.VehicleDto;
import com.lavadero.exception.DuplicateResourceException;
import com.lavadero.model.Client;
import com.lavadero.repository.ClientRepository;
import com.lavadero.service.impl.ClientServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ClientServiceImpl Tests")
class ClientServiceImplTest {

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ClientServiceImpl clientService;

    private ClientRequest request;
    private Client client;

    @BeforeEach
    void setUp() {
        request = new ClientRequest(
                "Juan",
                "Perez",
                "juan@example.com",
                "+54 9 11 1234-5678",
                "12345678",
                List.of(new VehicleDto("ABC123", "Toyota", "Corolla", 2020, "White"))
        );

        client = new Client();
        client.setId("client-1");
        client.setFirstName("Juan");
        client.setLastName("Perez");
        client.setEmail("juan@example.com");
        client.setPhone("+54 9 11 1234-5678");
        client.setDni("12345678");
        client.setVehicles(new ArrayList<>());
        client.setCreatedAt(LocalDateTime.now());
        client.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("createClient: success")
    void createClientSuccess() {
        when(clientRepository.existsByEmail(request.email())).thenReturn(false);
        when(clientRepository.existsByDni(request.dni())).thenReturn(false);
        when(clientRepository.save(any(Client.class))).thenReturn(client);

        ClientResponse response = clientService.createClient(request);

        assertThat(response.email()).isEqualTo("juan@example.com");
        assertThat(response.dni()).isEqualTo("12345678");
        verify(clientRepository).save(any(Client.class));
    }

    @Test
    @DisplayName("createClient: duplicate email")
    void createClientDuplicateEmail() {
        when(clientRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> clientService.createClient(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already exists");

        verify(clientRepository, never()).save(any(Client.class));
    }

    @Test
    @DisplayName("createClient: duplicate DNI")
    void createClientDuplicateDni() {
        when(clientRepository.existsByEmail(request.email())).thenReturn(false);
        when(clientRepository.existsByDni(request.dni())).thenReturn(true);

        assertThatThrownBy(() -> clientService.createClient(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("DNI already exists");

        verify(clientRepository, never()).save(any(Client.class));
    }

    @Test
    @DisplayName("updateClient: duplicate email when changed")
    void updateClientDuplicateEmail() {
        String clientId = "client-1";
        ClientRequest update = new ClientRequest(
                "Juan",
                "Perez",
                "other@example.com",
                request.phone(),
                request.dni(),
                List.of()
        );
        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(clientRepository.existsByEmail(update.email())).thenReturn(true);

        assertThatThrownBy(() -> clientService.updateClient(clientId, update))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already exists");

        verify(clientRepository, never()).save(any(Client.class));
    }

    @Test
    @DisplayName("updateClient: duplicate DNI when changed")
    void updateClientDuplicateDni() {
        String clientId = "client-1";
        ClientRequest update = new ClientRequest(
                "Juan",
                "Perez",
                request.email(),
                request.phone(),
                "87654321",
                List.of()
        );
        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(clientRepository.existsByDni(update.dni())).thenReturn(true);

        assertThatThrownBy(() -> clientService.updateClient(clientId, update))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("DNI already exists");

        verify(clientRepository, never()).save(any(Client.class));
    }
}
