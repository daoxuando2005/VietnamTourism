package vn.vietnamtourism.profile.infrastructure;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.*;
import vn.vietnamtourism.profile.application.ApiException;

public final class InputExceptionMappers {
    @Provider @Priority(Priorities.USER-100)
    public static class JsonInput implements ExceptionMapper<com.fasterxml.jackson.databind.exc.MismatchedInputException> {
        @Inject ApiExceptionMapper errors;
        @Override public Response toResponse(com.fasterxml.jackson.databind.exc.MismatchedInputException e) {
            return errors.toResponse(new ApiException(400,"INVALID_ARGUMENT","Dữ liệu gửi lên không hợp lệ."));
        }
    }
    @Provider @Priority(Priorities.USER-100)
    public static class Validation implements ExceptionMapper<jakarta.validation.ConstraintViolationException> {
        @Inject ApiExceptionMapper errors;
        @Override public Response toResponse(jakarta.validation.ConstraintViolationException e) { return errors.toResponse(e); }
    }
}
