namespace Server.Domain.Services;

using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Domain.Models;

public class RecurrenceCalculator : IRecurrenceCalculator
{
    private const int DefaultMaxOccurrencesWithoutFilter = 10;

    public IReadOnlyList<BillOccurrence> CalculateOccurrences(
        IEnumerable<Bill> bills,
        BillFilter filter,
        DateOnly referenceDate)
    {
        ArgumentNullException.ThrowIfNull(bills);
        ArgumentNullException.ThrowIfNull(filter);

        var occurrences = new List<BillOccurrence>();

        foreach (var bill in bills)
        {
            occurrences.AddRange(CalculateOccurrences(bill, filter, referenceDate));
        }

        return occurrences
            .OrderBy(o => o.DueDate)
            .ThenBy(o => o.BillTitle)
            .ToList();
    }

    public IReadOnlyList<BillOccurrence> CalculateOccurrences(
        Bill bill,
        BillFilter filter,
        DateOnly referenceDate)
    {
        ArgumentNullException.ThrowIfNull(bill);
        ArgumentNullException.ThrowIfNull(filter);

        var dueDates = filter.Type switch
        {
            BillFilterType.None => CalculateNextDueDates(bill, referenceDate, DefaultMaxOccurrencesWithoutFilter),
            BillFilterType.Month => CalculateMonthDueDates(bill, filter.Year ?? referenceDate.Year, filter.Month ?? referenceDate.Month),
            BillFilterType.NextDays => CalculateNextDaysDueDates(bill, referenceDate, filter.Days.GetValueOrDefault(30)),
            _ => CalculateNextDueDates(bill, referenceDate, DefaultMaxOccurrencesWithoutFilter)
        };

        var executions = bill.Executions.ToList();
        var occurrences = new List<BillOccurrence>();

        foreach (var dueDate in dueDates)
        {
            // Match execution: exact ReferenceDueDate match, or for Once bills any execution for that bill
            var execution = executions.FirstOrDefault(e =>
                (e.ReferenceDueDate.HasValue && e.ReferenceDueDate.Value == dueDate) ||
                (bill.Frequency == BillFrequency.Once && !e.ReferenceDueDate.HasValue));

            occurrences.Add(new BillOccurrence(
                BillId: bill.Id,
                BillTitle: bill.Title,
                ExpectedAmount: bill.ExpectedAmount,
                Frequency: bill.Frequency,
                DueDate: dueDate,
                IsPaid: execution != null,
                ExecutionId: execution?.Id,
                PaymentDate: execution?.PaymentDate,
                PaidAmount: execution?.PaidAmount,
                Notes: execution?.Notes ?? bill.Notes
            ));
        }

        return occurrences;
    }

    private static List<DateOnly> CalculateNextDueDates(Bill bill, DateOnly referenceDate, int count)
    {
        var result = new List<DateOnly>();

        switch (bill.Frequency)
        {
            case BillFrequency.Once:
                var singleDate = bill.DueDate ?? bill.StartDate;
                result.Add(singleDate);
                break;

            case BillFrequency.Monthly:
                var day = bill.DayOfMonth ?? 1;
                var currentYear = Math.Max(referenceDate.Year, bill.StartDate.Year);
                var currentMonth = (currentYear == bill.StartDate.Year && bill.StartDate.Month > referenceDate.Month)
                    ? bill.StartDate.Month
                    : referenceDate.Month;

                var startDateTime = new DateTime(currentYear, currentMonth, 1);
                var monthOffset = 0;
                while (result.Count < count)
                {
                    var targetMonthDate = startDateTime.AddMonths(monthOffset++);
                    var daysInMonth = DateTime.DaysInMonth(targetMonthDate.Year, targetMonthDate.Month);
                    var actualDay = Math.Min(day, daysInMonth);
                    var calculatedDate = new DateOnly(targetMonthDate.Year, targetMonthDate.Month, actualDay);

                    if (calculatedDate >= bill.StartDate)
                    {
                        result.Add(calculatedDate);
                    }
                }
                break;

            case BillFrequency.EveryNMonths:
                var interval = bill.IntervalMonths.GetValueOrDefault(1);
                var intervalDay = bill.DayOfMonth ?? 1;

                var totalMonthsDiff = ((referenceDate.Year - bill.StartDate.Year) * 12) + (referenceDate.Month - bill.StartDate.Month);
                var startPeriodIndex = 0;

                if (totalMonthsDiff > 0)
                {
                    startPeriodIndex = totalMonthsDiff / interval;
                }

                var periodOffset = 0;
                while (result.Count < count)
                {
                    var periodMonths = (startPeriodIndex + periodOffset++) * interval;
                    var basePeriodMonth = new DateTime(bill.StartDate.Year, bill.StartDate.Month, 1).AddMonths(periodMonths);
                    var daysInMonth = DateTime.DaysInMonth(basePeriodMonth.Year, basePeriodMonth.Month);
                    var actualDay = Math.Min(intervalDay, daysInMonth);
                    var calculatedDate = new DateOnly(basePeriodMonth.Year, basePeriodMonth.Month, actualDay);

                    if (calculatedDate >= bill.StartDate)
                    {
                        result.Add(calculatedDate);
                    }
                }
                break;

            case BillFrequency.Yearly:
                var yearlyMonth = bill.MonthOfYear ?? bill.StartDate.Month;
                var yearlyDay = bill.DayOfMonth ?? bill.StartDate.Day;
                var startYear = Math.Max(referenceDate.Year, bill.StartDate.Year);

                var yearOffset = 0;
                while (result.Count < count)
                {
                    var targetYear = startYear + yearOffset++;
                    var daysInMonth = DateTime.DaysInMonth(targetYear, yearlyMonth);
                    var actualDay = Math.Min(yearlyDay, daysInMonth);
                    var calculatedDate = new DateOnly(targetYear, yearlyMonth, actualDay);

                    if (calculatedDate >= bill.StartDate)
                    {
                        result.Add(calculatedDate);
                    }
                }
                break;
        }

        return result;
    }

    private static List<DateOnly> CalculateMonthDueDates(Bill bill, int year, int month)
    {
        var result = new List<DateOnly>();
        var firstDayOfMonth = new DateOnly(year, month, 1);
        var lastDayOfMonth = new DateOnly(year, month, DateTime.DaysInMonth(year, month));

        if (lastDayOfMonth < bill.StartDate)
            return result;

        switch (bill.Frequency)
        {
            case BillFrequency.Once:
                var singleDate = bill.DueDate ?? bill.StartDate;
                if (singleDate.Year == year && singleDate.Month == month)
                {
                    result.Add(singleDate);
                }
                break;

            case BillFrequency.Monthly:
                var day = bill.DayOfMonth ?? 1;
                var daysInMonth = DateTime.DaysInMonth(year, month);
                var actualDay = Math.Min(day, daysInMonth);
                var calculatedDate = new DateOnly(year, month, actualDay);
                if (calculatedDate >= bill.StartDate)
                {
                    result.Add(calculatedDate);
                }
                break;

            case BillFrequency.EveryNMonths:
                var interval = bill.IntervalMonths.GetValueOrDefault(1);
                var monthsFromStart = ((year - bill.StartDate.Year) * 12) + (month - bill.StartDate.Month);
                if (monthsFromStart >= 0 && monthsFromStart % interval == 0)
                {
                    var intervalDay = bill.DayOfMonth ?? 1;
                    var daysInTargetMonth = DateTime.DaysInMonth(year, month);
                    var actualIntervalDay = Math.Min(intervalDay, daysInTargetMonth);
                    var date = new DateOnly(year, month, actualIntervalDay);
                    if (date >= bill.StartDate)
                    {
                        result.Add(date);
                    }
                }
                break;

            case BillFrequency.Yearly:
                var targetYearlyMonth = bill.MonthOfYear ?? bill.StartDate.Month;
                if (month == targetYearlyMonth && year >= bill.StartDate.Year)
                {
                    var yearlyDay = bill.DayOfMonth ?? 1;
                    var daysInTargetMonth = DateTime.DaysInMonth(year, month);
                    var actualYearlyDay = Math.Min(yearlyDay, daysInTargetMonth);
                    var date = new DateOnly(year, month, actualYearlyDay);
                    if (date >= bill.StartDate)
                    {
                        result.Add(date);
                    }
                }
                break;
        }

        return result;
    }

    private static List<DateOnly> CalculateNextDaysDueDates(Bill bill, DateOnly referenceDate, int days)
    {
        var result = new List<DateOnly>();
        var endDate = referenceDate.AddDays(Math.Max(1, days));

        switch (bill.Frequency)
        {
            case BillFrequency.Once:
                var singleDate = bill.DueDate ?? bill.StartDate;
                if (singleDate >= referenceDate && singleDate <= endDate)
                {
                    result.Add(singleDate);
                }
                break;

            case BillFrequency.Monthly:
            case BillFrequency.EveryNMonths:
            case BillFrequency.Yearly:
                // Scan the calendar months spanning referenceDate to endDate
                var current = new DateTime(referenceDate.Year, referenceDate.Month, 1);
                var endMonth = new DateTime(endDate.Year, endDate.Month, 1);

                while (current <= endMonth)
                {
                    var monthDates = CalculateMonthDueDates(bill, current.Year, current.Month);
                    foreach (var d in monthDates)
                    {
                        if (d >= referenceDate && d <= endDate && !result.Contains(d))
                        {
                            result.Add(d);
                        }
                    }
                    current = current.AddMonths(1);
                }
                break;
        }

        return result;
    }
}
