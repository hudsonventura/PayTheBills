namespace Server.Endpoints;

using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Server.Application.DTOs;
using Server.Application.UseCases;
using Server.Domain.Models;

public static class BillEndpoints
{
    public static IEndpointRouteBuilder MapBillEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bills")
            .WithTags("Bills")
            .RequireAuthorization();

        // Get occurrences with filters (runtime generation)
        group.MapGet("/", async (
            ClaimsPrincipal user,
            BillUseCases billUseCases,
            [FromQuery] string? filterType,
            [FromQuery] int? year,
            [FromQuery] int? month,
            [FromQuery] int? days,
            [FromQuery] string? refDate,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            var referenceDate = DateOnly.FromDateTime(DateTime.Today);
            if (!string.IsNullOrEmpty(refDate) && DateOnly.TryParse(refDate, out var parsedRefDate))
            {
                referenceDate = parsedRefDate;
            }

            var type = filterType?.ToLowerInvariant() switch
            {
                "month" => BillFilterType.Month,
                "next_days" or "nextdays" => BillFilterType.NextDays,
                _ => BillFilterType.None
            };

            var filter = new BillFilter(
                Type: type,
                Year: year ?? referenceDate.Year,
                Month: month ?? referenceDate.Month,
                Days: days ?? 30
            );

            var occurrences = await billUseCases.GetOccurrencesAsync(userId.Value, filter, referenceDate, ct);
            return Results.Ok(occurrences);
        });

        // Get raw bills list
        group.MapGet("/list", async (
            ClaimsPrincipal user,
            BillUseCases billUseCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            var bills = await billUseCases.GetUserBillsAsync(userId.Value, ct);
            return Results.Ok(bills);
        });

        // Create a new bill
        group.MapPost("/", async (
            ClaimsPrincipal user,
            CreateBillRequest request,
            BillUseCases billUseCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            try
            {
                var bill = await billUseCases.CreateBillAsync(userId.Value, request, ct);
                return Results.Created($"/api/bills/{bill.Id}", bill);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        // Register execution (payment) for a bill
        group.MapPost("/{billId:guid}/executions", async (
            ClaimsPrincipal user,
            Guid billId,
            RegisterExecutionRequest request,
            BillUseCases billUseCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            try
            {
                var execution = await billUseCases.RegisterExecutionAsync(userId.Value, billId, request, ct);
                return Results.Created($"/api/bills/{billId}/executions/{execution.Id}", execution);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        // Delete execution (unmark payment)
        group.MapDelete("/executions/{executionId:guid}", async (
            ClaimsPrincipal user,
            Guid executionId,
            BillUseCases billUseCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            try
            {
                await billUseCases.DeleteExecutionAsync(userId.Value, executionId, ct);
                return Results.NoContent();
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        });

        // Delete bill
        group.MapDelete("/{billId:guid}", async (
            ClaimsPrincipal user,
            Guid billId,
            BillUseCases billUseCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            try
            {
                await billUseCases.DeleteBillAsync(userId.Value, billId, ct);
                return Results.NoContent();
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        });

        return app;
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var val = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? user.FindFirst("sub")?.Value;

        if (Guid.TryParse(val, out var parsed))
            return parsed;

        return null;
    }
}
