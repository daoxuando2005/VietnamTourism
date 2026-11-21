package vn.vietnamtourism.profile.api.dto;

import jakarta.validation.constraints.*;

public record BootstrapRequest(@NotBlank @Pattern(regexp="[a-z0-9_]{3,40}") String username,
    @NotBlank @Size(max=100) String displayName) {}
