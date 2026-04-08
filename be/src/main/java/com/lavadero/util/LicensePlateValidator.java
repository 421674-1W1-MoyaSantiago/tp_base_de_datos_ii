package com.lavadero.util;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.*;
import java.util.regex.Pattern;

public class LicensePlateValidator {
    
    private static final Pattern OLD_FORMAT = Pattern.compile("^[A-Z]{3}\\d{3}$");
    private static final Pattern NEW_FORMAT = Pattern.compile("^[A-Z]{2}\\d{3}[A-Z]{2}$");
    
    public static boolean isValid(String licensePlate) {
        if (licensePlate == null || licensePlate.isBlank()) {
            return false;
        }
        
        String normalized = licensePlate.trim().toUpperCase().replace(" ", "");
        return OLD_FORMAT.matcher(normalized).matches() || NEW_FORMAT.matcher(normalized).matches();
    }
    
    public static String normalize(String licensePlate) {
        if (licensePlate == null) {
            return null;
        }
        return licensePlate.trim().toUpperCase().replace(" ", "");
    }
    
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    @Constraint(validatedBy = ValidLicensePlateValidator.class)
    @Documented
    public @interface ValidLicensePlate {
        String message() default "Invalid Argentine license plate format. Must be ABC123 or AB123CD";
        Class<?>[] groups() default {};
        Class<? extends Payload>[] payload() default {};
    }
    
    public static class ValidLicensePlateValidator 
            implements ConstraintValidator<ValidLicensePlate, String> {
        
        @Override
        public boolean isValid(String value, ConstraintValidatorContext context) {
            if (value == null || value.isBlank()) {
                return true;
            }
            return LicensePlateValidator.isValid(value);
        }
    }
}
