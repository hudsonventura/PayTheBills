namespace Server.Endpoints;

using System.Security.Claims;
using Server.Application.DTOs;
using Server.Application.UseCases;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");

        group.MapPost("/register", async (RegisterRequest request, AuthUseCases authUseCases, CancellationToken ct) =>
        {
            try
            {
                var response = await authUseCases.RegisterAsync(request, ct);
                return Results.Created($"/api/auth/me", response);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new { message = ex.Message });
            }
        });

        group.MapGet("/login", () =>
        {
            return Results.Ok(new
            {
                message = "Authentication endpoint. Send a POST request with email and password to log in."
            });
        });

        group.MapPost("/login", async (LoginRequest request, AuthUseCases authUseCases, CancellationToken ct) =>
        {
            try
            {
                var response = await authUseCases.LoginAsync(request, ct);
                return Results.Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Json(new { message = ex.Message }, statusCode: StatusCodes.Status401Unauthorized);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        group.MapGet("/me", async (ClaimsPrincipal claimsPrincipal, AuthUseCases authUseCases, CancellationToken ct) =>
        {
            var userIdString = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? claimsPrincipal.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                return Results.Unauthorized();
            }

            try
            {
                var profile = await authUseCases.GetProfileAsync(userId, ct);
                return Results.Ok(profile);
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        }).RequireAuthorization();

        return app;
    }
}
