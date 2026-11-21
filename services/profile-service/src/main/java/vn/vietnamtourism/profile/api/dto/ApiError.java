package vn.vietnamtourism.profile.api.dto;

import java.time.Instant;
import java.util.List;

public record ApiError(String code, String message, String requestId, Instant timestamp, List<FieldError> errors) {
    public record FieldError(String field, String message) {}
}
