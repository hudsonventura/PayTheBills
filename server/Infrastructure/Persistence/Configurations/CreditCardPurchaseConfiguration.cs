namespace Server.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Domain.Entities;

public class CreditCardPurchaseConfiguration : IEntityTypeConfiguration<CreditCardPurchase>
{
    public void Configure(EntityTypeBuilder<CreditCardPurchase> builder)
    {
        builder.ToTable("credit_card_purchases");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedNever();

        builder.Property(p => p.UserId)
            .IsRequired();

        builder.HasOne(p => p.User)
            .WithMany(u => u.CreditCardPurchases)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(p => p.CreditCardId)
            .IsRequired();

        builder.HasOne(p => p.CreditCard)
            .WithMany(c => c.Purchases)
            .HasForeignKey(p => p.CreditCardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(p => p.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(p => p.PurchaseDate)
            .IsRequired();

        builder.Property(p => p.TotalAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.TotalInstallments)
            .IsRequired();

        builder.Property(p => p.InstallmentAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(p => p.FirstInstallmentMonth)
            .IsRequired();

        builder.Property(p => p.Notes)
            .HasMaxLength(1000);

        builder.Property(p => p.CreatedAtUtc)
            .IsRequired();

        builder.Property(p => p.UpdatedAtUtc);

        builder.HasIndex(p => p.UserId);
        builder.HasIndex(p => p.CreditCardId);
    }
}
