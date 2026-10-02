namespace Server.Infrastructure.Security;

using System.Security.Cryptography;
using System.Text;
using Server.Application.Interfaces;

public class Pbkdf2PasswordHasher : IPasswordHasher
{
    private const int HashSize = 32;
    private const int Iterations = 100000;
    private static readonly HashAlgorithmName Algorithm = HashAlgorithmName.SHA256;

    private static readonly char[] SpecialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?".ToCharArray();
    private static readonly char[] AlphaNumericChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".ToCharArray();

    public string GenerateSalt()
    {
        // 16 characters with at least 6 special characters
        var chars = new char[16];
        var specialCount = RandomNumberGenerator.GetInt32(6, 11); // 6 to 10 special characters
        var alphaCount = 16 - specialCount;

        for (int i = 0; i < specialCount; i++)
        {
            chars[i] = SpecialChars[RandomNumberGenerator.GetInt32(SpecialChars.Length)];
        }

        for (int i = 0; i < alphaCount; i++)
        {
            chars[specialCount + i] = AlphaNumericChars[RandomNumberGenerator.GetInt32(AlphaNumericChars.Length)];
        }

        // Fisher-Yates cryptographically secure shuffle
        for (int i = chars.Length - 1; i > 0; i--)
        {
            int j = RandomNumberGenerator.GetInt32(i + 1);
            (chars[i], chars[j]) = (chars[j], chars[i]);
        }

        return new string(chars);
    }

    public string HashPassword(string password, string salt)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        ArgumentException.ThrowIfNullOrWhiteSpace(salt);

        var saltedPassword = $"{salt}{password}";
        var saltBytes = Encoding.UTF8.GetBytes(salt);
        var hash = Rfc2898DeriveBytes.Pbkdf2(saltedPassword, saltBytes, Iterations, Algorithm, HashSize);

        return $"{Iterations}.{Convert.ToBase64String(hash)}";
    }

    public bool VerifyPassword(string password, string salt, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(passwordHash))
            return false;

        var parts = passwordHash.Split('.');
        if (parts.Length == 2)
        {
            if (string.IsNullOrWhiteSpace(salt))
                return false;

            if (!int.TryParse(parts[0], out var iterations))
                return false;

            var expectedHash = Convert.FromBase64String(parts[1]);
            var saltedPassword = $"{salt}{password}";
            var saltBytes = Encoding.UTF8.GetBytes(salt);

            var actualHash = Rfc2898DeriveBytes.Pbkdf2(saltedPassword, saltBytes, iterations, Algorithm, expectedHash.Length);

            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }

        if (parts.Length == 3)
        {
            // Backward compatibility for old 3-part hashes (iterations.salt.hash)
            if (!int.TryParse(parts[0], out var iterations))
                return false;

            var oldSalt = Convert.FromBase64String(parts[1]);
            var expectedHash = Convert.FromBase64String(parts[2]);

            var actualHash = Rfc2898DeriveBytes.Pbkdf2(password, oldSalt, iterations, Algorithm, expectedHash.Length);

            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }

        return false;
    }
}
