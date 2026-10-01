namespace Server.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Domain.Entities;

public class BillExecutionConfiguration : IEntityTypeConfiguration<BillExecution>
{
    public void Configure(EntityTypeBuilder<BillExecution> builder)
    {
        builder.ToTable("bill_executions");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();

        builder.Property(e => e.BillId)
            .IsRequired();

        builder.HasOne(e => e.Bill)
            .WithMany(b => b.Executions)
            .HasForeignKey(e => e.BillId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(e => e.PaymentDate)
            .IsRequired();

        builder.Property(e => e.PaidAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(e => e.ReferenceDueDate);

        builder.Property(e => e.Notes)
            .HasMaxLength(1000);

        builder.Property(e => e.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(e => e.BillId);
        builder.HasIndex(e => new { e.BillId, e.ReferenceDueDate });
    }
}
