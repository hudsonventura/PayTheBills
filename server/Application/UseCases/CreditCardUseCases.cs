namespace Server.Application.UseCases;

using Microsoft.EntityFrameworkCore;
using Server.Application.DTOs;
using Server.Application.Interfaces;
using Server.Domain.Entities;

public class CreditCardUseCases
{
    private readonly IAppDbContext _context;

    public CreditCardUseCases(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CreditCardResponse>> GetCardsAsync(Guid userId, CancellationToken ct = default)
    {
        var cards = await _context.CreditCards
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

        var currentMonth = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

        var purchases = await _context.CreditCardPurchases
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .ToListAsync(ct);

        return cards.Select(card =>
        {
            var cardPurchases = purchases.Where(p => p.CreditCardId == card.Id).ToList();
            var activeCount = 0;
            decimal remainingSum = 0;

            foreach (var p in cardPurchases)
            {
                var lastMonth = p.FirstInstallmentMonth.AddMonths(p.TotalInstallments - 1);
                if (lastMonth >= currentMonth)
                {
                    activeCount++;
                    var diff = (currentMonth.Year - p.FirstInstallmentMonth.Year) * 12 + (currentMonth.Month - p.FirstInstallmentMonth.Month);
                    var paid = Math.Max(0, Math.Min(p.TotalInstallments, diff));
                    var remaining = Math.Max(0, p.TotalInstallments - paid);
                    remainingSum += remaining * p.InstallmentAmount;
                }
            }

            return new CreditCardResponse(
                Id: card.Id,
                Name: card.Name,
                Color: card.Color,
                ClosingDay: card.ClosingDay,
                DueDay: card.DueDay,
                ActivePurchasesCount: activeCount,
                TotalRemainingAmount: remainingSum,
                CreatedAtUtc: card.CreatedAtUtc
            );
        }).ToList();
    }

    public async Task<CreditCardResponse> CreateCardAsync(Guid userId, CreateCreditCardRequest request, CancellationToken ct = default)
    {
        var card = new CreditCard(
            id: global::SnowflakeGuid.NewGuid(),
            userId: userId,
            name: request.Name,
            color: request.Color,
            closingDay: request.ClosingDay,
            dueDay: request.DueDay
        );

        _context.CreditCards.Add(card);
        await _context.SaveChangesAsync(ct);

        return new CreditCardResponse(
            Id: card.Id,
            Name: card.Name,
            Color: card.Color,
            ClosingDay: card.ClosingDay,
            DueDay: card.DueDay,
            ActivePurchasesCount: 0,
            TotalRemainingAmount: 0,
            CreatedAtUtc: card.CreatedAtUtc
        );
    }

    public async Task<CreditCardResponse> UpdateCardAsync(Guid userId, Guid cardId, UpdateCreditCardRequest request, CancellationToken ct = default)
    {
        var card = await _context.CreditCards
            .FirstOrDefaultAsync(c => c.Id == cardId && c.UserId == userId, ct);

        if (card == null)
            throw new KeyNotFoundException("Credit card not found or does not belong to this user.");

        card.Update(
            name: request.Name,
            color: request.Color,
            closingDay: request.ClosingDay,
            dueDay: request.DueDay
        );

        await _context.SaveChangesAsync(ct);

        var currentMonth = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var purchases = await _context.CreditCardPurchases
            .AsNoTracking()
            .Where(p => p.UserId == userId && p.CreditCardId == cardId)
            .ToListAsync(ct);

        var activeCount = 0;
        decimal remainingSum = 0;
        foreach (var p in purchases)
        {
            var lastMonth = p.FirstInstallmentMonth.AddMonths(p.TotalInstallments - 1);
            if (lastMonth >= currentMonth)
            {
                activeCount++;
                var diff = (currentMonth.Year - p.FirstInstallmentMonth.Year) * 12 + (currentMonth.Month - p.FirstInstallmentMonth.Month);
                var paid = Math.Max(0, Math.Min(p.TotalInstallments, diff));
                var remaining = Math.Max(0, p.TotalInstallments - paid);
                remainingSum += remaining * p.InstallmentAmount;
            }
        }

        return new CreditCardResponse(
            Id: card.Id,
            Name: card.Name,
            Color: card.Color,
            ClosingDay: card.ClosingDay,
            DueDay: card.DueDay,
            ActivePurchasesCount: activeCount,
            TotalRemainingAmount: remainingSum,
            CreatedAtUtc: card.CreatedAtUtc
        );
    }

    public async Task DeleteCardAsync(Guid userId, Guid cardId, CancellationToken ct = default)
    {
        var card = await _context.CreditCards
            .FirstOrDefaultAsync(c => c.Id == cardId && c.UserId == userId, ct);

        if (card == null)
            throw new KeyNotFoundException("Credit card not found or does not belong to this user.");

        _context.CreditCards.Remove(card);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<List<CreditCardPurchaseResponse>> GetPurchasesAsync(Guid userId, Guid? creditCardId = null, CancellationToken ct = default)
    {
        var query = _context.CreditCardPurchases
            .AsNoTracking()
            .Include(p => p.CreditCard)
            .Where(p => p.UserId == userId);

        if (creditCardId.HasValue && creditCardId.Value != Guid.Empty)
        {
            query = query.Where(p => p.CreditCardId == creditCardId.Value);
        }

        var purchases = await query
            .OrderByDescending(p => p.PurchaseDate)
            .ToListAsync(ct);

        var currentMonth = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

        return purchases.Select(p => MapToPurchaseResponse(p, currentMonth)).ToList();
    }

    public async Task<CreditCardPurchaseResponse> CreatePurchaseAsync(Guid userId, CreateCreditCardPurchaseRequest request, CancellationToken ct = default)
    {
        var card = await _context.CreditCards
            .FirstOrDefaultAsync(c => c.Id == request.CreditCardId && c.UserId == userId, ct);

        if (card == null)
            throw new KeyNotFoundException("Credit card not found or does not belong to this user.");

        var firstMonth = request.FirstInstallmentMonth ?? SuggestFirstInstallmentMonth(request.PurchaseDate, card.ClosingDay);

        var purchase = new CreditCardPurchase(
            id: global::SnowflakeGuid.NewGuid(),
            userId: userId,
            creditCardId: card.Id,
            title: request.Title,
            purchaseDate: request.PurchaseDate,
            totalAmount: request.TotalAmount,
            totalInstallments: request.TotalInstallments,
            firstInstallmentMonth: firstMonth,
            installmentAmount: request.InstallmentAmount,
            notes: request.Notes
        );

        _context.CreditCardPurchases.Add(purchase);
        await _context.SaveChangesAsync(ct);

        var currentMonth = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        return new CreditCardPurchaseResponse(
            Id: purchase.Id,
            CreditCardId: card.Id,
            CreditCardName: card.Name,
            CreditCardColor: card.Color,
            Title: purchase.Title,
            PurchaseDate: purchase.PurchaseDate,
            TotalAmount: purchase.TotalAmount,
            TotalInstallments: purchase.TotalInstallments,
            InstallmentAmount: purchase.InstallmentAmount,
            FirstInstallmentMonth: purchase.FirstInstallmentMonth,
            Notes: purchase.Notes,
            PaidInstallmentsCount: 0,
            RemainingInstallmentsCount: purchase.TotalInstallments,
            RemainingAmount: purchase.TotalInstallments * purchase.InstallmentAmount,
            IsCompleted: false,
            CreatedAtUtc: purchase.CreatedAtUtc
        );
    }

    public async Task<CreditCardPurchaseResponse> UpdatePurchaseAsync(Guid userId, Guid purchaseId, UpdateCreditCardPurchaseRequest request, CancellationToken ct = default)
    {
        var purchase = await _context.CreditCardPurchases
            .Include(p => p.CreditCard)
            .FirstOrDefaultAsync(p => p.Id == purchaseId && p.UserId == userId, ct);

        if (purchase == null)
            throw new KeyNotFoundException("Purchase not found or does not belong to this user.");

        var card = await _context.CreditCards
            .FirstOrDefaultAsync(c => c.Id == request.CreditCardId && c.UserId == userId, ct);

        if (card == null)
            throw new KeyNotFoundException("Credit card not found or does not belong to this user.");

        purchase.Update(
            creditCardId: card.Id,
            title: request.Title,
            purchaseDate: request.PurchaseDate,
            totalAmount: request.TotalAmount,
            totalInstallments: request.TotalInstallments,
            firstInstallmentMonth: request.FirstInstallmentMonth,
            installmentAmount: request.InstallmentAmount,
            notes: request.Notes
        );

        await _context.SaveChangesAsync(ct);

        var currentMonth = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        return MapToPurchaseResponse(purchase, currentMonth);
    }

    public async Task DeletePurchaseAsync(Guid userId, Guid purchaseId, CancellationToken ct = default)
    {
        var purchase = await _context.CreditCardPurchases
            .FirstOrDefaultAsync(p => p.Id == purchaseId && p.UserId == userId, ct);

        if (purchase == null)
            throw new KeyNotFoundException("Purchase not found or does not belong to this user.");

        _context.CreditCardPurchases.Remove(purchase);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<CreditCardTimelineResponse> GetTimelineAndProjectionAsync(
        Guid userId,
        Guid? creditCardId = null,
        DateOnly? referenceMonth = null,
        CancellationToken ct = default)
    {
        var refMonth = referenceMonth.HasValue
            ? new DateOnly(referenceMonth.Value.Year, referenceMonth.Value.Month, 1)
            : new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

        var query = _context.CreditCardPurchases
            .AsNoTracking()
            .Include(p => p.CreditCard)
            .Where(p => p.UserId == userId);

        if (creditCardId.HasValue && creditCardId.Value != Guid.Empty)
        {
            query = query.Where(p => p.CreditCardId == creditCardId.Value);
        }

        var allPurchases = await query.ToListAsync(ct);

        var ganttItems = new List<InstallmentGanttItemDto>();
        var activePurchases = new List<CreditCardPurchase>();

        foreach (var p in allPurchases)
        {
            var lastMonth = p.FirstInstallmentMonth.AddMonths(p.TotalInstallments - 1);
            var diff = (refMonth.Year - p.FirstInstallmentMonth.Year) * 12 + (refMonth.Month - p.FirstInstallmentMonth.Month);
            var paid = Math.Max(0, Math.Min(p.TotalInstallments, diff));
            var remaining = Math.Max(0, p.TotalInstallments - paid);
            var isCompleted = remaining == 0;
            var currentInstallmentNum = (diff >= 0 && diff < p.TotalInstallments)
                ? diff + 1
                : (diff < 0 ? 0 : p.TotalInstallments);

            ganttItems.Add(new InstallmentGanttItemDto(
                Id: p.Id,
                Title: p.Title,
                CreditCardId: p.CreditCardId,
                CreditCardName: p.CreditCard?.Name ?? "Cartão",
                CreditCardColor: p.CreditCard?.Color,
                PurchaseDate: p.PurchaseDate,
                TotalAmount: p.TotalAmount,
                TotalInstallments: p.TotalInstallments,
                InstallmentAmount: p.InstallmentAmount,
                FirstInstallmentMonth: p.FirstInstallmentMonth,
                LastInstallmentMonth: lastMonth,
                CurrentInstallmentNumber: currentInstallmentNum,
                RemainingInstallments: remaining,
                RemainingAmount: remaining * p.InstallmentAmount,
                IsCompleted: isCompleted
            ));

            if (!isCompleted || lastMonth >= refMonth)
            {
                activePurchases.Add(p);
            }
        }

        // Determine timeline span
        DateOnly finalMonth;
        if (activePurchases.Count > 0)
        {
            var maxInstallmentMonth = activePurchases.Max(p => p.FirstInstallmentMonth.AddMonths(p.TotalInstallments - 1));
            finalMonth = maxInstallmentMonth < refMonth ? refMonth.AddMonths(5) : maxInstallmentMonth;
        }
        else
        {
            finalMonth = refMonth.AddMonths(5);
        }

        // Generate monthly projections from refMonth to finalMonth
        var monthlySummaries = new List<MonthlyInstallmentSummaryDto>();
        var curr = refMonth;
        decimal currentMonthTotal = 0;
        decimal totalRemainingAllMonths = 0;

        while (curr <= finalMonth)
        {
            var monthlyItems = new List<MonthlyInstallmentItemDto>();
            decimal monthTotal = 0;

            foreach (var p in allPurchases)
            {
                var diff = (curr.Year - p.FirstInstallmentMonth.Year) * 12 + (curr.Month - p.FirstInstallmentMonth.Month);
                if (diff >= 0 && diff < p.TotalInstallments)
                {
                    var item = new MonthlyInstallmentItemDto(
                        PurchaseId: p.Id,
                        PurchaseTitle: p.Title,
                        CreditCardId: p.CreditCardId,
                        CreditCardName: p.CreditCard?.Name ?? "Cartão",
                        CreditCardColor: p.CreditCard?.Color,
                        InstallmentNumber: diff + 1,
                        TotalInstallments: p.TotalInstallments,
                        InstallmentAmount: p.InstallmentAmount
                    );
                    monthlyItems.Add(item);
                    monthTotal += p.InstallmentAmount;
                }
            }

            if (curr == refMonth)
            {
                currentMonthTotal = monthTotal;
            }

            if (curr >= refMonth)
            {
                totalRemainingAllMonths += monthTotal;
            }

            monthlySummaries.Add(new MonthlyInstallmentSummaryDto(
                Year: curr.Year,
                Month: curr.Month,
                ActivePurchasesCount: monthlyItems.Count,
                TotalAmount: monthTotal,
                Items: monthlyItems
            ));

            curr = curr.AddMonths(1);
        }

        // Sort gantt items by: active first, then by FirstInstallmentMonth
        ganttItems = ganttItems
            .OrderBy(g => g.IsCompleted ? 1 : 0)
            .ThenBy(g => g.FirstInstallmentMonth)
            .ThenBy(g => g.Title)
            .ToList();

        var totalActive = ganttItems.Count(g => !g.IsCompleted);

        return new CreditCardTimelineResponse(
            ReferenceMonth: refMonth,
            FinalMonth: finalMonth,
            TotalActivePurchases: totalActive,
            TotalRemainingAmount: totalRemainingAllMonths,
            CurrentMonthTotal: currentMonthTotal,
            MonthlySummaries: monthlySummaries,
            GanttItems: ganttItems
        );
    }

    public static DateOnly SuggestFirstInstallmentMonth(DateOnly purchaseDate, int closingDay)
    {
        // If purchase date day is on or before closing day, it enters the current month's bill
        // If purchase date day is after closing day, it enters the next month's bill
        if (purchaseDate.Day <= closingDay)
        {
            return new DateOnly(purchaseDate.Year, purchaseDate.Month, 1);
        }
        else
        {
            var next = purchaseDate.AddMonths(1);
            return new DateOnly(next.Year, next.Month, 1);
        }
    }

    private static CreditCardPurchaseResponse MapToPurchaseResponse(CreditCardPurchase p, DateOnly currentMonth)
    {
        var diff = (currentMonth.Year - p.FirstInstallmentMonth.Year) * 12 + (currentMonth.Month - p.FirstInstallmentMonth.Month);
        var paid = Math.Max(0, Math.Min(p.TotalInstallments, diff));
        var remaining = Math.Max(0, p.TotalInstallments - paid);
        var isCompleted = remaining == 0;

        return new CreditCardPurchaseResponse(
            Id: p.Id,
            CreditCardId: p.CreditCardId,
            CreditCardName: p.CreditCard?.Name ?? "Cartão",
            CreditCardColor: p.CreditCard?.Color,
            Title: p.Title,
            PurchaseDate: p.PurchaseDate,
            TotalAmount: p.TotalAmount,
            TotalInstallments: p.TotalInstallments,
            InstallmentAmount: p.InstallmentAmount,
            FirstInstallmentMonth: p.FirstInstallmentMonth,
            Notes: p.Notes,
            PaidInstallmentsCount: paid,
            RemainingInstallmentsCount: remaining,
            RemainingAmount: remaining * p.InstallmentAmount,
            IsCompleted: isCompleted,
            CreatedAtUtc: p.CreatedAtUtc
        );
    }
}
