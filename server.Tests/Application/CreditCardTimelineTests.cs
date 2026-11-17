namespace Server.Tests.Application;

using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Server.Application.DTOs;
using Server.Application.UseCases;
using Server.Domain.Entities;
using Server.Infrastructure.Persistence;
using Xunit;

public class CreditCardTimelineTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _context;
    private readonly CreditCardUseCases _useCases;
    private readonly Guid _userId = Guid.NewGuid();

    public CreditCardTimelineTests()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new AppDbContext(options);
        _context.Database.EnsureCreated();

        var user = new User(_userId, "Test User", "test@example.com", "hash", "salt");
        _context.Users.Add(user);
        _context.SaveChanges();

        _useCases = new CreditCardUseCases(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task GetTimelineAndProjection_ComputesCorrectMonthlyAmountsAndGanttItems()
    {
        // 1. Create Credit Cards
        var card1 = new CreditCard(Guid.NewGuid(), _userId, "Nubank", "#8A05BE", 20, 27);
        var card2 = new CreditCard(Guid.NewGuid(), _userId, "XP Visa", "#000000", 10, 17);
        _context.CreditCards.AddRange(card1, card2);

        // 2. Add Purchases
        // Purchase 1: 3x R$ 100 in Nubank starting Nov 2026 (Nov, Dec, Jan)
        var p1 = new CreditCardPurchase(
            id: Guid.NewGuid(),
            userId: _userId,
            creditCardId: card1.Id,
            title: "Tênis Corrida",
            purchaseDate: new DateOnly(2026, 10, 25),
            totalAmount: 300m,
            totalInstallments: 3,
            firstInstallmentMonth: new DateOnly(2026, 11, 1),
            installmentAmount: 100m
        );

        // Purchase 2: 5x R$ 200 in XP starting Dec 2026 (Dec, Jan, Feb, Mar, Apr)
        var p2 = new CreditCardPurchase(
            id: Guid.NewGuid(),
            userId: _userId,
            creditCardId: card2.Id,
            title: "Passagens Aéreas",
            purchaseDate: new DateOnly(2026, 11, 15),
            totalAmount: 1000m,
            totalInstallments: 5,
            firstInstallmentMonth: new DateOnly(2026, 12, 1),
            installmentAmount: 200m
        );

        _context.CreditCardPurchases.AddRange(p1, p2);
        await _context.SaveChangesAsync();

        // 3. Act: Calculate Timeline with RefMonth = 2026-11-01
        var refMonth = new DateOnly(2026, 11, 1);
        var timeline = await _useCases.GetTimelineAndProjectionAsync(_userId, null, refMonth);

        // 4. Assert
        Assert.Equal(refMonth, timeline.ReferenceMonth);
        Assert.Equal(new DateOnly(2027, 4, 1), timeline.FinalMonth); // Apr 2027 is the last month of p2 (Dec + 4 months)
        Assert.Equal(2, timeline.TotalActivePurchases);
        Assert.Equal(100m, timeline.CurrentMonthTotal); // Only p1 in Nov 2026
        Assert.Equal(1300m, timeline.TotalRemainingAmount); // 300 + 1000

        // Verify monthly summaries
        // Nov 2026: 1 item, R$ 100
        var nov = timeline.MonthlySummaries.First(m => m.Year == 2026 && m.Month == 11);
        Assert.Equal(1, nov.ActivePurchasesCount);
        Assert.Equal(100m, nov.TotalAmount);
        Assert.Single(nov.Items);
        Assert.Equal(1, nov.Items[0].InstallmentNumber);

        // Dec 2026: 2 items, R$ 300 (100 + 200)
        var dec = timeline.MonthlySummaries.First(m => m.Year == 2026 && m.Month == 12);
        Assert.Equal(2, dec.ActivePurchasesCount);
        Assert.Equal(300m, dec.TotalAmount);

        // Jan 2027: 2 items, R$ 300 (100 + 200)
        var jan = timeline.MonthlySummaries.First(m => m.Year == 2027 && m.Month == 1);
        Assert.Equal(2, jan.ActivePurchasesCount);
        Assert.Equal(300m, jan.TotalAmount);

        // Feb 2027: 1 item, R$ 200 (only p2, p1 finished in Jan)
        var feb = timeline.MonthlySummaries.First(m => m.Year == 2027 && m.Month == 2);
        Assert.Equal(1, feb.ActivePurchasesCount);
        Assert.Equal(200m, feb.TotalAmount);

        // Apr 2027: 1 item, R$ 200 (last installment of p2)
        var apr = timeline.MonthlySummaries.First(m => m.Year == 2027 && m.Month == 4);
        Assert.Equal(1, apr.ActivePurchasesCount);
        Assert.Equal(200m, apr.TotalAmount);
        Assert.Equal(5, apr.Items[0].InstallmentNumber);

        // Verify Gantt items
        Assert.Equal(2, timeline.GanttItems.Count);
        var g1 = timeline.GanttItems.First(g => g.Title == "Tênis Corrida");
        Assert.Equal(new DateOnly(2026, 11, 1), g1.FirstInstallmentMonth);
        Assert.Equal(new DateOnly(2027, 1, 1), g1.LastInstallmentMonth);
        Assert.Equal(1, g1.CurrentInstallmentNumber);
        Assert.Equal(3, g1.RemainingInstallments);
    }

    [Fact]
    public async Task GetTimelineAndProjection_FiltersByCardId()
    {
        var card1 = new CreditCard(Guid.NewGuid(), _userId, "Nubank", "#8A05BE", 20, 27);
        var card2 = new CreditCard(Guid.NewGuid(), _userId, "XP Visa", "#000000", 10, 17);
        _context.CreditCards.AddRange(card1, card2);

        var p1 = new CreditCardPurchase(
            id: Guid.NewGuid(),
            userId: _userId,
            creditCardId: card1.Id,
            title: "Nubank Purchase",
            purchaseDate: new DateOnly(2026, 11, 1),
            totalAmount: 300m,
            totalInstallments: 3,
            firstInstallmentMonth: new DateOnly(2026, 11, 1)
        );

        var p2 = new CreditCardPurchase(
            id: Guid.NewGuid(),
            userId: _userId,
            creditCardId: card2.Id,
            title: "XP Purchase",
            purchaseDate: new DateOnly(2026, 11, 1),
            totalAmount: 500m,
            totalInstallments: 5,
            firstInstallmentMonth: new DateOnly(2026, 11, 1)
        );

        _context.CreditCardPurchases.AddRange(p1, p2);
        await _context.SaveChangesAsync();

        var timeline = await _useCases.GetTimelineAndProjectionAsync(_userId, card1.Id, new DateOnly(2026, 11, 1));

        Assert.Single(timeline.GanttItems);
        Assert.Equal("Nubank Purchase", timeline.GanttItems[0].Title);
        Assert.Equal(300m, timeline.TotalRemainingAmount);
    }

    [Theory]
    [InlineData(15, 20, 2026, 10, 2026, 10)] // Bought on 15th, closes on 20th -> current month
    [InlineData(22, 20, 2026, 10, 2026, 11)] // Bought on 22nd, closes on 20th -> next month
    [InlineData(25, 25, 2026, 12, 2026, 12)] // Bought on closing day -> current month
    [InlineData(28, 25, 2026, 12, 2027, 1)]  // Bought after closing day in Dec -> Jan next year
    public void SuggestFirstInstallmentMonth_CalculatesAccurately(
        int buyDay, int closingDay, int buyYear, int buyMonth, int expectedYear, int expectedMonth)
    {
        var purchaseDate = new DateOnly(buyYear, buyMonth, buyDay);
        var suggested = CreditCardUseCases.SuggestFirstInstallmentMonth(purchaseDate, closingDay);

        Assert.Equal(expectedYear, suggested.Year);
        Assert.Equal(expectedMonth, suggested.Month);
        Assert.Equal(1, suggested.Day);
    }
}
