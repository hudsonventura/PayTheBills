namespace Server.Tests.Infrastructure;

using Microsoft.Extensions.Configuration;
using Server.Domain.Entities;
using Server.Infrastructure.Security;
using Xunit;

public class SecurityTests
{
    [Fact]
    public void SnowflakeGuid_Generates_NonEmptyAndUniqueGuids()
    {
        var id1 = SnowflakeGuid.NewGuid();
        var id2 = SnowflakeGuid.NewGuid();

        Assert.NotEqual(Guid.Empty, id1);
        Assert.NotEqual(Guid.Empty, id2);
        Assert.NotEqual(id1, id2);
    }

    [Fact]
    public void Pbkdf2PasswordHasher_HashesAndVerifiesPasswordCorrectly()
    {
        var hasher = new Pbkdf2PasswordHasher();
        var password = "MySecurePassword123!";

        var hash = hasher.HashPassword(password);

        Assert.False(string.IsNullOrWhiteSpace(hash));
        Assert.True(hasher.VerifyPassword(password, hash));
        Assert.False(hasher.VerifyPassword("WrongPassword", hash));
    }

    [Fact]
    public void JwtTokenService_GeneratesValidTokenForUser()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            {"Jwt:Key", "unit-test-super-secret-key-that-is-at-least-32-chars-long!"},
            {"Jwt:Issuer", "TestIssuer"},
            {"Jwt:Audience", "TestAudience"}
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var tokenService = new JwtTokenService(configuration);
        var user = new User(Guid.NewGuid(), "Hudson", "hudson@test.com", "fakehash");

        var token = tokenService.GenerateToken(user);

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.Equal(3, token.Split('.').Length);
    }
}
