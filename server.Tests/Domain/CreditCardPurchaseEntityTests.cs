namespace Server.Tests.Domain;

using Server.Domain.Entities;
using Xunit;

public class CreditCardPurchaseEntityTests
{
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _cardId = Guid.NewGuid();

    [Fact]
    public void Constructor_CalculatesInstallmentAmountAutomatically()
    {
        var id = Guid.NewGuid();
        var purchase = new CreditCardPurchase(
            id: id,
            userId: _userId,
            creditCardId: _cardId,
            title: "Notebook Gamer",
            purchaseDate: new DateOnly(2026, 10, 15),
            totalAmount: 3000m,
            totalInstallments: 10,
            firstInstallmentMonth: new DateOnly(2026, 11, 20) // Day 20 should normalize to Day 1
        );

        Assert.Equal(id, purchase.Id);
        Assert.Equal(300m, purchase.InstallmentAmount);
        Assert.Equal(new DateOnly(2026, 11, 1), purchase.FirstInstallmentMonth);
        Assert.Equal("Notebook Gamer", purchase.Title);
    }

    [Fact]
    public void Constructor_AcceptsCustomInstallmentAmount()
    {
        var purchase = new CreditCardPurchase(
            id: Guid.NewGuid(),
            userId: _userId,
            creditCardId: _cardId,
            title: "Passagem Aérea",
            purchaseDate: new DateOnly(2026, 10, 1),
            totalAmount: 1000m,
            totalInstallments: 3,
            firstInstallmentMonth: new DateOnly(2026, 10, 1),
            installmentAmount: 333.34m
        );

        Assert.Equal(333.34m, purchase.InstallmentAmount);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-50)]
    public void Constructor_Throws_WhenTotalAmountIsZeroOrNegative(decimal amount)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new CreditCardPurchase(
            id: Guid.NewGuid(),
            userId: _userId,
            creditCardId: _cardId,
            title: "Compra",
            purchaseDate: new DateOnly(2026, 10, 1),
            totalAmount: amount,
            totalInstallments: 5,
            firstInstallmentMonth: new DateOnly(2026, 10, 1)
        ));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Constructor_Throws_WhenInstallmentsLessThanOne(int installments)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new CreditCardPurchase(
            id: Guid.NewGuid(),
            userId: _userId,
            creditCardId: _cardId,
            title: "Compra",
            purchaseDate: new DateOnly(2026, 10, 1),
            totalAmount: 100m,
            totalInstallments: installments,
            firstInstallmentMonth: new DateOnly(2026, 10, 1)
        ));
    }

    [Fact]
    public void Update_ModifiesPurchaseProperties()
    {
        var purchase = new CreditCardPurchase(
            id: Guid.NewGuid(),
            userId: _userId,
            creditCardId: _cardId,
            title: "Compra Inicial",
            purchaseDate: new DateOnly(2026, 10, 1),
            totalAmount: 100m,
            totalInstallments: 2,
            firstInstallmentMonth: new DateOnly(2026, 10, 1)
        );

        var newCardId = Guid.NewGuid();
        purchase.Update(
            creditCardId: newCardId,
            title: "Compra Atualizada",
            purchaseDate: new DateOnly(2026, 10, 5),
            totalAmount: 200m,
            totalInstallments: 4,
            firstInstallmentMonth: new DateOnly(2026, 11, 1),
            notes: "Observação teste"
        );

        Assert.Equal(newCardId, purchase.CreditCardId);
        Assert.Equal("Compra Atualizada", purchase.Title);
        Assert.Equal(200m, purchase.TotalAmount);
        Assert.Equal(4, purchase.TotalInstallments);
        Assert.Equal(50m, purchase.InstallmentAmount);
        Assert.Equal(new DateOnly(2026, 11, 1), purchase.FirstInstallmentMonth);
        Assert.Equal("Observação teste", purchase.Notes);
        Assert.NotNull(purchase.UpdatedAtUtc);
    }
}
