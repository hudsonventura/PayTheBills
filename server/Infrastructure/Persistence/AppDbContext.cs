namespace Server.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;
using Server.Application.Interfaces;
using Server.Domain.Entities;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Bill> Bills => Set<Bill>();
    public DbSet<BillExecution> BillExecutions => Set<BillExecution>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
