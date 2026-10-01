namespace Server.Domain.Models;

public enum BillFilterType
{
    None = 0,
    Month = 1,
    NextDays = 2
}

public record BillFilter(
    BillFilterType Type,
    int? Year = null,
    int? Month = null,
    int? Days = null
);
