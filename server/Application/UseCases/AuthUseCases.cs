namespace Server.Application.UseCases;

using Microsoft.EntityFrameworkCore;
using Server.Application.DTOs;
using Server.Application.Interfaces;
using Server.Domain.Entities;

public class AuthUseCases
{
    private readonly IAppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthUseCases(
        IAppDbContext context,
        IPasswordHasher _passwordHasher,
        ITokenService _tokenService)
    {
        _context = context;
        this._passwordHasher = _passwordHasher;
        this._tokenService = _tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ArgumentException("Email is required.", nameof(request.Email));

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            throw new ArgumentException("Password must be at least 6 characters.", nameof(request.Password));

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existing = await _context.Users.AnyAsync(u => u.Email == normalizedEmail, ct);
        if (existing)
        {
            throw new InvalidOperationException("Email is already registered.");
        }

        var id = global::SnowflakeGuid.NewGuid();
        var passwordHash = _passwordHasher.HashPassword(request.Password);
        var user = new User(id, request.Name, normalizedEmail, passwordHash);

        _context.Users.Add(user);
        await _context.SaveChangesAsync(ct);

        var token = _tokenService.GenerateToken(user);
        return new AuthResponse(user.Id, user.Name, user.Email, token);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, ct);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var token = _tokenService.GenerateToken(user);
        return new AuthResponse(user.Id, user.Name, user.Email, token);
    }

    public async Task<UserProfileResponse> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null)
            throw new KeyNotFoundException("User not found.");

        return new UserProfileResponse(user.Id, user.Name, user.Email);
    }
}
