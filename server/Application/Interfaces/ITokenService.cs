namespace Server.Application.Interfaces;

using Server.Domain.Entities;

public interface ITokenService
{
    string GenerateToken(User user);
}
