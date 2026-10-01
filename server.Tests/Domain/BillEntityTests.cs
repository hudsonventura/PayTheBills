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
}
