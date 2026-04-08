package com.lavadero.service;

import com.lavadero.dto.LoginRequest;
import com.lavadero.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
