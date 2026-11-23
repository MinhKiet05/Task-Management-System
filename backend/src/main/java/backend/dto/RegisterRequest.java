package backend.dto;

import java.util.Locale;

import backend.security.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(max = 120) String name,
        @ValidPassword String password) {
    public RegisterRequest {
        email = email == null ? null : email.strip().toLowerCase(Locale.ROOT);
        name = name == null ? null : name.strip();
    }

    @Override public String toString() { return "RegisterRequest[REDACTED]"; }
}
