namespace Server.Application.Interfaces;

using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Bill> Bills { get; }
    DbSet<BillExecution> BillExecutions { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
