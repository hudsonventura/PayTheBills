namespace Server.Domain.Services;

using Server.Domain.Entities;
using Server.Domain.Models;

public interface IRecurrenceCalculator
{
    IReadOnlyList<BillOccurrence> CalculateOccurrences(
        Bill bill,
        BillFilter filter,
        DateOnly referenceDate);

    IReadOnlyList<BillOccurrence> CalculateOccurrences(
        IEnumerable<Bill> bills,
        BillFilter filter,
        DateOnly referenceDate);
}
