namespace Server.Tests.Domain;

using Server.Domain.Entities;
using Xunit;

public class CreditCardEntityTests
{
    private readonly Guid _userId = Guid.NewGuid();

    [Fact]
    public void Constructor_Success_WhenValidParameters()
    {
        var id = Guid.NewGuid();
        var card = new CreditCard(
            id: id,
            userId: _userId,
            name: "Nubank Ultravioleta",
            color: "#8A05BE",
            closingDay: 20,
            dueDay: 27
        );

        Assert.Equal(id, card.Id);
        Assert.Equal(_userId, card.UserId);
        Assert.Equal("Nubank Ultravioleta", card.Name);
        Assert.Equal("#8A05BE", card.Color);
        Assert.Equal(20, card.ClosingDay);
        Assert.Equal(27, card.DueDay);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Constructor_Throws_WhenNameIsEmpty(string name)
    {
        Assert.Throws<ArgumentException>(() => new CreditCard(
            id: Guid.NewGuid(),
            userId: _userId,
            name: name,
            color: null,
            closingDay: 10,
            dueDay: 17
        ));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(32)]
    public void Constructor_Throws_WhenClosingDayOutOfRange(int day)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new CreditCard(
            id: Guid.NewGuid(),
            userId: _userId,
            name: "Visa",
            color: null,
            closingDay: day,
            dueDay: 15
        ));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(32)]
    public void Constructor_Throws_WhenDueDayOutOfRange(int day)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new CreditCard(
            id: Guid.NewGuid(),
            userId: _userId,
            name: "Visa",
            color: null,
            closingDay: 10,
            dueDay: day
        ));
    }

    [Fact]
    public void Update_ModifiesCardProperties()
    {
        var card = new CreditCard(
            id: Guid.NewGuid(),
            userId: _userId,
            name: "Visa",
            color: "#000",
            closingDay: 5,
            dueDay: 12
        );

        card.Update("Visa Infinite", "#111", 7, 14);

        Assert.Equal("Visa Infinite", card.Name);
        Assert.Equal("#111", card.Color);
        Assert.Equal(7, card.ClosingDay);
        Assert.Equal(14, card.DueDay);
        Assert.NotNull(card.UpdatedAtUtc);
    }
}
