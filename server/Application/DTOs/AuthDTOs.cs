namespace Server.Application.DTOs;

public record RegisterRequest(
    string Name,
    string Email,
    string Password
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    Guid Id,
    string Name,
    string Email,
    string Token
);

public record UserProfileResponse(
    Guid Id,
    string Name,
    string Email
);
