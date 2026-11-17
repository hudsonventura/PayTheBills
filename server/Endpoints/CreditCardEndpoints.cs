namespace Server.Endpoints;

using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Server.Application.DTOs;
using Server.Application.UseCases;

public static class CreditCardEndpoints
{
    public static IEndpointRouteBuilder MapCreditCardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/credit-cards")
            .WithTags("CreditCards")
            .RequireAuthorization();

        // ----------------- Cards -----------------
        group.MapGet("/", async (
            ClaimsPrincipal user,
            CreditCardUseCases useCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            var cards = await useCases.GetCardsAsync(userId.Value, ct);
            return Results.Ok(cards);
        });

        group.MapPost("/", async (
            ClaimsPrincipal user,
            CreateCreditCardRequest request,
            CreditCardUseCases useCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            try
            {
                var card = await useCases.CreateCardAsync(userId.Value, request, ct);
                return Results.Created($"/api/credit-cards/{card.Id}", card);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        group.MapPut("/{cardId:guid}", async (
            ClaimsPrincipal user,
            Guid cardId,
            UpdateCreditCardRequest request,
            CreditCardUseCases useCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            try
            {
                var card = await useCases.UpdateCardAsync(userId.Value, cardId, request, ct);
                return Results.Ok(card);
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        group.MapDelete("/{cardId:guid}", async (
            ClaimsPrincipal user,
            Guid cardId,
            CreditCardUseCases useCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            try
            {
                await useCases.DeleteCardAsync(userId.Value, cardId, ct);
                return Results.NoContent();
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        });

        // ----------------- Purchases -----------------
        group.MapGet("/purchases", async (
            ClaimsPrincipal user,
            [FromQuery] Guid? cardId,
            CreditCardUseCases useCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            var purchases = await useCases.GetPurchasesAsync(userId.Value, cardId, ct);
            return Results.Ok(purchases);
        });

        group.MapPost("/purchases", async (
            ClaimsPrincipal user,
            CreateCreditCardPurchaseRequest request,
            CreditCardUseCases useCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            try
            {
                var purchase = await useCases.CreatePurchaseAsync(userId.Value, request, ct);
                return Results.Created($"/api/credit-cards/purchases/{purchase.Id}", purchase);
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

        group.MapPut("/purchases/{purchaseId:guid}", async (
            ClaimsPrincipal user,
            Guid purchaseId,
            UpdateCreditCardPurchaseRequest request,
            CreditCardUseCases useCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            try
            {
                var purchase = await useCases.UpdatePurchaseAsync(userId.Value, purchaseId, request, ct);
                return Results.Ok(purchase);
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

        group.MapDelete("/purchases/{purchaseId:guid}", async (
            ClaimsPrincipal user,
            Guid purchaseId,
            CreditCardUseCases useCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            try
            {
                await useCases.DeletePurchaseAsync(userId.Value, purchaseId, ct);
                return Results.NoContent();
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound();
            }
        });

        // ----------------- Timeline / Gantt / Projections -----------------
        group.MapGet("/timeline", async (
            ClaimsPrincipal user,
            [FromQuery] Guid? cardId,
            [FromQuery] string? refMonth,
            CreditCardUseCases useCases,
            CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId == null) return Results.Unauthorized();

            DateOnly? referenceMonth = null;
            if (!string.IsNullOrEmpty(refMonth) && DateOnly.TryParse(refMonth + "-01", out var parsed))
            {
                referenceMonth = parsed;
            }

            var timeline = await useCases.GetTimelineAndProjectionAsync(userId.Value, cardId, referenceMonth, ct);
            return Results.Ok(timeline);
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
