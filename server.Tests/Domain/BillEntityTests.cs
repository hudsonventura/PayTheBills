namespace Server.Tests.Domain;

using Server.Domain.Entities;
using Server.Domain.Enums;
using Xunit;

public class BillEntityTests
{
    private readonly Guid _userId = Guid.NewGuid();

    [Fact]
    public void Constructor_Throws_WhenTitleIsEmpty()
    {
        Assert.Throws<ArgumentException>(() => new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "",
            expectedAmount: 100m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 10
        ));
    }

    [Fact]
    public void Constructor_Throws_WhenDayOfMonthIsOutOfRange()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Gym",
            expectedAmount: 100m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 32
        ));
    }

    [Fact]
    public void Constructor_Throws_WhenOnceHasNoDueDate()
    {
        Assert.Throws<ArgumentException>(() => new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Tax",
            expectedAmount: 100m,
            frequency: BillFrequency.Once,
            startDate: new DateOnly(2026, 1, 1),
            dueDate: null
        ));
    }

    [Fact]
    public void Constructor_Throws_WhenEveryNMonthsHasZeroInterval()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Club Fee",
            expectedAmount: 100m,
            frequency: BillFrequency.EveryNMonths,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 15,
            intervalMonths: 0
        ));
    }

    [Fact]
    public void Constructor_Throws_WhenYearlyHasInvalidMonth()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "License",
            expectedAmount: 100m,
            frequency: BillFrequency.Yearly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 15,
            monthOfYear: 13
        ));
    }

    [Fact]
    public void Constructor_SetsPaymentLink_WhenProvidedAndTrims()
    {
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Condominium",
            expectedAmount: 500m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 10,
            paymentLink: "  https://banco.com/boleto/123  "
        );

        Assert.Equal("https://banco.com/boleto/123", bill.PaymentLink);
    }

    [Fact]
    public void Constructor_SetsPaymentLinkToNull_WhenWhitespaceOrNull()
    {
        var billWithWhitespace = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Condominium",
            expectedAmount: 500m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 10,
            paymentLink: "   "
        );

        Assert.Null(billWithWhitespace.PaymentLink);

        var billWithNull = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Condominium",
            expectedAmount: 500m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 10,
            paymentLink: null
        );

        Assert.Null(billWithNull.PaymentLink);
    }

    [Fact]
    public void UpdatePaymentLink_UpdatesLinkAndTimestamp()
    {
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Electricity",
            expectedAmount: 150m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 10
        );

        Assert.Null(bill.PaymentLink);
        Assert.Null(bill.UpdatedAtUtc);

        bill.UpdatePaymentLink(" https://concessionaria.com/boleto/999 ");

        Assert.Equal("https://concessionaria.com/boleto/999", bill.PaymentLink);
        Assert.NotNull(bill.UpdatedAtUtc);
    }

    [Fact]
    public void Update_ModifiesPropertiesAndSetsUpdatedAtUtc()
    {
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Electricity",
            expectedAmount: 150m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 10
        );

        bill.Update(
            title: "Updated Electricity",
            expectedAmount: 200m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 2, 1),
            dayOfMonth: 15,
            notes: "New notes",
            paymentLink: "https://newlink.com"
        );

        Assert.Equal("Updated Electricity", bill.Title);
        Assert.Equal(200m, bill.ExpectedAmount);
        Assert.Equal(new DateOnly(2026, 2, 1), bill.StartDate);
        Assert.Equal(15, bill.DayOfMonth);
        Assert.Equal("New notes", bill.Notes);
        Assert.Equal("https://newlink.com", bill.PaymentLink);
        Assert.NotNull(bill.UpdatedAtUtc);
    }

    [Fact]
    public void Update_ThrowsException_WhenInvalidParameters()
    {
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Electricity",
            expectedAmount: 150m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 10
        );

        Assert.Throws<ArgumentException>(() => bill.Update(
            title: "",
            expectedAmount: 100m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 10
        ));

        Assert.Throws<ArgumentOutOfRangeException>(() => bill.Update(
            title: "Valid",
            expectedAmount: -10m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 10
        ));
    }
}
