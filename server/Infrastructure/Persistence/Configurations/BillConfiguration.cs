namespace Server.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Domain.Entities;

public class BillConfiguration : IEntityTypeConfiguration<Bill>
{
    public void Configure(EntityTypeBuilder<Bill> builder)
    {
        builder.ToTable("bills");

        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).ValueGeneratedNever();

        builder.Property(b => b.UserId)
            .IsRequired();

        builder.HasOne(b => b.User)
            .WithMany(u => u.Bills)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(b => b.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(b => b.ExpectedAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(b => b.Frequency)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(b => b.StartDate)
            .IsRequired();

        builder.Property(b => b.DueDate);
        builder.Property(b => b.DayOfMonth);
        builder.Property(b => b.MonthOfYear);
        builder.Property(b => b.IntervalMonths);

        builder.Property(b => b.Notes)
            .HasMaxLength(1000);

        builder.Property(b => b.PaymentLink)
            .HasMaxLength(1000);

        builder.Property(b => b.CreatedAtUtc)
            .IsRequired();

        builder.Property(b => b.UpdatedAtUtc);

        builder.HasIndex(b => b.UserId);
    }
}
