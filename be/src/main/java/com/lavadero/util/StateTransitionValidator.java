package com.lavadero.util;

import com.lavadero.model.ServiceStatus;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Component
public class StateTransitionValidator {
    
    private static final Map<ServiceStatus, Set<ServiceStatus>> VALID_TRANSITIONS = new EnumMap<>(ServiceStatus.class);
    
    static {
        VALID_TRANSITIONS.put(ServiceStatus.PENDING, EnumSet.of(ServiceStatus.IN_PROGRESS));
        VALID_TRANSITIONS.put(ServiceStatus.IN_PROGRESS, EnumSet.of(ServiceStatus.COMPLETED));
        VALID_TRANSITIONS.put(ServiceStatus.COMPLETED, EnumSet.of(ServiceStatus.DELIVERED));
        VALID_TRANSITIONS.put(ServiceStatus.DELIVERED, EnumSet.noneOf(ServiceStatus.class));
    }
    
    public boolean isValidTransition(ServiceStatus from, ServiceStatus to) {
        if (from == null || to == null) {
            return false;
        }
        
        if (from == to) {
            return false;
        }
        
        Set<ServiceStatus> allowedTransitions = VALID_TRANSITIONS.get(from);
        return allowedTransitions != null && allowedTransitions.contains(to);
    }
    
    public Set<ServiceStatus> getAllowedTransitions(ServiceStatus from) {
        if (from == null) {
            return EnumSet.noneOf(ServiceStatus.class);
        }
        
        Set<ServiceStatus> transitions = VALID_TRANSITIONS.get(from);
        return transitions != null ? EnumSet.copyOf(transitions) : EnumSet.noneOf(ServiceStatus.class);
    }
    
    public String getTransitionErrorMessage(ServiceStatus from, ServiceStatus to) {
        if (from == null || to == null) {
            return "Invalid state: from and to states cannot be null";
        }
        
        if (from == to) {
            return String.format("Invalid transition: status is already %s", from);
        }
        
        Set<ServiceStatus> allowed = getAllowedTransitions(from);
        if (allowed.isEmpty()) {
            return String.format("Invalid transition: %s is a final state and cannot be changed", from);
        }
        
        return String.format("Invalid transition from %s to %s. Allowed transitions: %s", 
                           from, to, allowed);
    }
}
