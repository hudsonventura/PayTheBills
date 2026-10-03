namespace Server.Tests.Domain;

using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Domain.Models;
using Server.Domain.Services;
using Xunit;

public class RecurrenceCalculatorTests
{
    private readonly RecurrenceCalculator _calculator = new();
    private readonly Guid _userId = Guid.NewGuid();

    [Fact]
    public void CalculateOccurrences_WithoutFilter_GeneratesNext10RecurrencesForMonthlyBill()
    {
        // Arrange
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Internet",
            expectedAmount: 100m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 10
        );

        var filter = new BillFilter(BillFilterType.None);
        var refDate = new DateOnly(2026, 10, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert
        Assert.Equal(10, occurrences.Count);
        Assert.Equal(new DateOnly(2026, 10, 10), occurrences[0].DueDate);
        Assert.Equal(new DateOnly(2026, 11, 10), occurrences[1].DueDate);
        Assert.Equal(new DateOnly(2026, 12, 10), occurrences[2].DueDate);
        Assert.Equal(new DateOnly(2027, 1, 10), occurrences[3].DueDate);
        Assert.Equal(new DateOnly(2027, 7, 10), occurrences[9].DueDate);
    }

    [Fact]
    public void CalculateOccurrences_Monthly_ClampsToLastDayOfMonthIfDayExceedsDaysInMonth()
    {
        // Arrange: Day 31 for monthly bill
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Rent",
            expectedAmount: 1200m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 31
        );

        var filter = new BillFilter(BillFilterType.None);
        var refDate = new DateOnly(2026, 1, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert
        Assert.Equal(new DateOnly(2026, 1, 31), occurrences[0].DueDate);
        // February 2026 has 28 days
        Assert.Equal(new DateOnly(2026, 2, 28), occurrences[1].DueDate);
        // March has 31 days
        Assert.Equal(new DateOnly(2026, 3, 31), occurrences[2].DueDate);
        // April has 30 days
        Assert.Equal(new DateOnly(2026, 4, 30), occurrences[3].DueDate);
    }

    [Fact]
    public void CalculateOccurrences_EveryNMonths_GeneratesCorrectIntervals()
    {
        // Arrange: every 3 months on day 15
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Quarterly Insurance",
            expectedAmount: 300m,
            frequency: BillFrequency.EveryNMonths,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 15,
            intervalMonths: 3
        );

        var filter = new BillFilter(BillFilterType.None);
        var refDate = new DateOnly(2026, 1, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert
        Assert.Equal(10, occurrences.Count);
        Assert.Equal(new DateOnly(2026, 1, 15), occurrences[0].DueDate);
        Assert.Equal(new DateOnly(2026, 4, 15), occurrences[1].DueDate);
        Assert.Equal(new DateOnly(2026, 7, 15), occurrences[2].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 15), occurrences[3].DueDate);
        Assert.Equal(new DateOnly(2027, 1, 15), occurrences[4].DueDate);
    }

    [Fact]
    public void CalculateOccurrences_Yearly_GeneratesNext10Years()
    {
        // Arrange: Yearly in December on day 20
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Car Tax",
            expectedAmount: 500m,
            frequency: BillFrequency.Yearly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 20,
            monthOfYear: 12
        );

        var filter = new BillFilter(BillFilterType.None);
        var refDate = new DateOnly(2026, 1, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert
        Assert.Equal(10, occurrences.Count);
        Assert.Equal(new DateOnly(2026, 12, 20), occurrences[0].DueDate);
        Assert.Equal(new DateOnly(2027, 12, 20), occurrences[1].DueDate);
        Assert.Equal(new DateOnly(2035, 12, 20), occurrences[9].DueDate);
    }

    [Fact]
    public void CalculateOccurrences_Once_GeneratesSingleOccurrence()
    {
        // Arrange
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "New Monitor",
            expectedAmount: 450m,
            frequency: BillFrequency.Once,
            startDate: new DateOnly(2026, 10, 1),
            dueDate: new DateOnly(2026, 10, 25)
        );

        var filter = new BillFilter(BillFilterType.None);
        var refDate = new DateOnly(2026, 10, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert
        Assert.Single(occurrences);
        Assert.Equal(new DateOnly(2026, 10, 25), occurrences[0].DueDate);
    }

    [Fact]
    public void CalculateOccurrences_MonthFilter_ReturnsOccurrencesOnlyForThatMonth()
    {
        // Arrange
        var billMonthly = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Electricity",
            expectedAmount: 150m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 12
        );

        var filter = new BillFilter(BillFilterType.Month, Year: 2026, Month: 11);
        var refDate = new DateOnly(2026, 10, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(billMonthly, filter, refDate);

        // Assert
        Assert.Single(occurrences);
        Assert.Equal(new DateOnly(2026, 11, 12), occurrences[0].DueDate);
    }

    [Fact]
    public void CalculateOccurrences_NextDaysFilter_ReturnsOccurrencesWithinRange()
    {
        // Arrange
        var billMonthly = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Water",
            expectedAmount: 80m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 1, 1),
            dayOfMonth: 15
        );

        // Today is Oct 10, next 10 days spans Oct 10 to Oct 20
        var refDate = new DateOnly(2026, 10, 10);
        var filter = new BillFilter(BillFilterType.NextDays, Days: 10);

        // Act
        var occurrences = _calculator.CalculateOccurrences(billMonthly, filter, refDate);

        // Assert: Oct 15 is within Oct 10 - Oct 20
        Assert.Single(occurrences);
        Assert.Equal(new DateOnly(2026, 10, 15), occurrences[0].DueDate);

        // Next test: Next 3 days spans Oct 10 to Oct 13 -> Oct 15 not included
        var filterShort = new BillFilter(BillFilterType.NextDays, Days: 3);
        var occurrencesShort = _calculator.CalculateOccurrences(billMonthly, filterShort, refDate);
        Assert.Empty(occurrencesShort);
    }

    [Fact]
    public void CalculateOccurrences_MatchesExecution_MarksOccurrenceAsPaid()
    {
        // Arrange
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Phone Plan",
            expectedAmount: 50m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 10, 1),
            dayOfMonth: 10
        );

        var dueDate = new DateOnly(2026, 10, 10);
        var execution = new BillExecution(
            id: Guid.NewGuid(),
            billId: bill.Id,
            paymentDate: new DateOnly(2026, 10, 9),
            paidAmount: 50m,
            referenceDueDate: dueDate,
            notes: "Paid via pix"
        );
        bill.AddExecution(execution);

        var filter = new BillFilter(BillFilterType.None);
        var refDate = new DateOnly(2026, 10, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert
        var first = occurrences[0];
        Assert.True(first.IsPaid);
        Assert.Equal(execution.Id, first.ExecutionId);
        Assert.Equal(new DateOnly(2026, 10, 9), first.PaymentDate);
        Assert.Equal(50m, first.PaidAmount);

        // Second occurrence in Nov is pending
        var second = occurrences[1];
        Assert.False(second.IsPaid);
        Assert.Null(second.ExecutionId);
    }

    [Fact]
    public void CalculateOccurrences_PropagatesPaymentLink_ToOccurrences()
    {
        // Arrange
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Energy Bill",
            expectedAmount: 180m,
            frequency: BillFrequency.Monthly,
            startDate: new DateOnly(2026, 10, 1),
            dayOfMonth: 15,
            paymentLink: "https://energy.example.com/boleto/october"
        );

        var filter = new BillFilter(BillFilterType.None);
        var refDate = new DateOnly(2026, 10, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert
        Assert.NotEmpty(occurrences);
        Assert.All(occurrences, occ => Assert.Equal("https://energy.example.com/boleto/october", occ.PaymentLink));
    }

    [Fact]
    public void CalculateOccurrences_Weekly_WithoutFilter_GeneratesNext10RecurrencesOnGivenDayOfWeek()
    {
        // Arrange: Weekly on Friday (5), starting Oct 1, 2026 (Thursday)
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Weekly Grocery",
            expectedAmount: 200m,
            frequency: BillFrequency.Weekly,
            startDate: new DateOnly(2026, 10, 1),
            dayOfWeek: DayOfWeek.Friday
        );

        var filter = new BillFilter(BillFilterType.None);
        var refDate = new DateOnly(2026, 10, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert
        Assert.Equal(10, occurrences.Count);
        Assert.Equal(new DateOnly(2026, 10, 2), occurrences[0].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 9), occurrences[1].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 16), occurrences[2].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 23), occurrences[3].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 30), occurrences[4].DueDate);
        Assert.Equal(new DateOnly(2026, 11, 6), occurrences[5].DueDate);
        Assert.Equal(new DateOnly(2026, 11, 13), occurrences[6].DueDate);
        Assert.Equal(new DateOnly(2026, 11, 20), occurrences[7].DueDate);
        Assert.Equal(new DateOnly(2026, 11, 27), occurrences[8].DueDate);
        Assert.Equal(new DateOnly(2026, 12, 4), occurrences[9].DueDate);
        Assert.All(occurrences, o => Assert.Equal(DayOfWeek.Friday, o.DueDate.DayOfWeek));
    }

    [Fact]
    public void CalculateOccurrences_Weekly_DoesNotGenerateOccurrencesBeforeStartDate()
    {
        // Arrange: StartDate Oct 15, 2026 (Thursday), Weekly on Friday. RefDate is Oct 1, 2026.
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Pool Cleaning",
            expectedAmount: 70m,
            frequency: BillFrequency.Weekly,
            startDate: new DateOnly(2026, 10, 15),
            dayOfWeek: DayOfWeek.Friday
        );

        var filter = new BillFilter(BillFilterType.None);
        var refDate = new DateOnly(2026, 10, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert: First occurrence is Oct 16 (since Oct 2 and Oct 9 are before StartDate)
        Assert.Equal(new DateOnly(2026, 10, 16), occurrences[0].DueDate);
        Assert.All(occurrences, o => Assert.True(o.DueDate >= bill.StartDate));
    }

    [Fact]
    public void CalculateOccurrences_Weekly_MonthFilter_ReturnsOccurrencesOnlyForThatMonth()
    {
        // Arrange: Weekly on Friday starting Oct 1, 2026
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Gardening",
            expectedAmount: 60m,
            frequency: BillFrequency.Weekly,
            startDate: new DateOnly(2026, 10, 1),
            dayOfWeek: DayOfWeek.Friday
        );

        // October 2026 has 5 Fridays: 2, 9, 16, 23, 30
        var filter = new BillFilter(BillFilterType.Month, Year: 2026, Month: 10);
        var refDate = new DateOnly(2026, 10, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert
        Assert.Equal(5, occurrences.Count);
        Assert.Equal(new DateOnly(2026, 10, 2), occurrences[0].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 9), occurrences[1].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 16), occurrences[2].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 23), occurrences[3].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 30), occurrences[4].DueDate);
    }

    [Fact]
    public void CalculateOccurrences_Weekly_NextDaysFilter_ReturnsOccurrencesWithinRange()
    {
        // Arrange: Weekly on Monday (1) starting Oct 1, 2026 (Thursday)
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Weekly Music Class",
            expectedAmount: 90m,
            frequency: BillFrequency.Weekly,
            startDate: new DateOnly(2026, 10, 1),
            dayOfWeek: DayOfWeek.Monday
        );

        // RefDate is Monday Oct 5, 2026. Next 14 days -> Oct 5 to Oct 19
        // Mondays in range: Oct 5, Oct 12, Oct 19
        var filter = new BillFilter(BillFilterType.NextDays, Days: 14);
        var refDate = new DateOnly(2026, 10, 5);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert
        Assert.Equal(3, occurrences.Count);
        Assert.Equal(new DateOnly(2026, 10, 5), occurrences[0].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 12), occurrences[1].DueDate);
        Assert.Equal(new DateOnly(2026, 10, 19), occurrences[2].DueDate);
    }

    [Theory]
    [InlineData(DayOfWeek.Sunday, "2026-10-04")]
    [InlineData(DayOfWeek.Saturday, "2026-10-03")]
    public void CalculateOccurrences_Weekly_SupportsSundayAndSaturday(DayOfWeek dayOfWeek, string expectedFirstDate)
    {
        // Arrange: Start date Thursday Oct 1, 2026
        var bill = new Bill(
            id: Guid.NewGuid(),
            userId: _userId,
            title: "Weekend Service",
            expectedAmount: 100m,
            frequency: BillFrequency.Weekly,
            startDate: new DateOnly(2026, 10, 1),
            dayOfWeek: dayOfWeek
        );

        var filter = new BillFilter(BillFilterType.None);
        var refDate = new DateOnly(2026, 10, 1);

        // Act
        var occurrences = _calculator.CalculateOccurrences(bill, filter, refDate);

        // Assert
        Assert.Equal(DateOnly.Parse(expectedFirstDate), occurrences[0].DueDate);
        Assert.Equal(dayOfWeek, occurrences[0].DueDate.DayOfWeek);
    }
}
