namespace Server.Tests.Domain;

using Server.Domain.Entities;
using Server.Infrastructure.Security;
using Xunit;

public class UserEntityTests
{
    [Fact]
    public void Constructor_Throws_WhenIdIsEmpty()
    {
        Assert.Throws<ArgumentException>(() => new User(Guid.Empty, "Admin", "admin", "hash", "salt"));
    }

    [Fact]
    public void Constructor_Throws_WhenNameIsEmpty()
    {
        Assert.Throws<ArgumentException>(() => new User(Guid.NewGuid(), "", "admin", "hash", "salt"));
    }

    [Fact]
    public void Constructor_Throws_WhenEmailIsEmpty()
    {
        Assert.Throws<ArgumentException>(() => new User(Guid.NewGuid(), "Admin", " ", "hash", "salt"));
    }

    [Fact]
    public void Constructor_Throws_WhenPasswordHashIsEmpty()
    {
        Assert.Throws<ArgumentException>(() => new User(Guid.NewGuid(), "Admin", "admin", " ", "salt"));
    }

    [Fact]
    public void Constructor_Throws_WhenPasswordSaltIsEmpty()
    {
        Assert.Throws<ArgumentException>(() => new User(Guid.NewGuid(), "Admin", "admin", "hash", " "));
    }

    [Fact]
    public void DefaultAdminUser_CanBeInstantiatedAndVerifiedWithPbkdf2Hasher()
    {
        var hasher = new Pbkdf2PasswordHasher();
        const string adminSalt = "!@#_$%^&aB12cD34";
        var adminPassword = "admin";
        var adminHash = hasher.HashPassword(adminPassword, adminSalt);

        var adminUser = new User(
            id: Guid.Parse("00000000-0000-0000-0000-000000000001"),
            name: "Administrador",
            email: "admin",
            passwordHash: adminHash,
            passwordSalt: adminSalt
        );

        Assert.Equal("admin", adminUser.Email);
        Assert.Equal("Administrador", adminUser.Name);
        Assert.Equal(adminSalt, adminUser.PasswordSalt);
        Assert.True(hasher.VerifyPassword("admin", adminUser.PasswordSalt, adminUser.PasswordHash));
        Assert.False(hasher.VerifyPassword("wrong", adminUser.PasswordSalt, adminUser.PasswordHash));
    }
}
