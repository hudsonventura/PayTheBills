namespace Server.Extensions;

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Application.Interfaces;
using Server.Application.UseCases;
using Server.Domain.Services;
using Server.Endpoints;
using Server.Infrastructure.Persistence;
using Server.Infrastructure.Security;

public static class AppExtensions
{
    public static WebApplicationBuilder ConfigureServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddOpenApi();

        // Database
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
        builder.Services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        // Security & Token services
        builder.Services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
        builder.Services.AddSingleton<ITokenService, JwtTokenService>();

        // Domain services
        builder.Services.AddSingleton<IRecurrenceCalculator, RecurrenceCalculator>();

        // Application Use Cases
        builder.Services.AddScoped<AuthUseCases>();
        builder.Services.AddScoped<BillUseCases>();

        // Authentication & Authorization
        var jwtKey = builder.Configuration["Jwt:Key"] ?? "pay-the-bills-super-secret-development-key-2026-min-32-chars!";
        var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "PayTheBillsServer";
        var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "PayTheBillsClient";

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                };
            });
        builder.Services.AddAuthorization();

        // CORS configuration to allow direct requests from Vite frontend (localhost:5173 / 127.0.0.1:5173)
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.SetIsOriginAllowed(_ => true)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        return builder;
    }

    public static WebApplication ConfigurePipeline(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseCors();

        app.UseDefaultFiles();
        app.UseStaticFiles();

        app.UseAuthentication();
        app.UseAuthorization();

        // Ensure database migrations are applied
        try
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var connectionString = app.Configuration.GetConnectionString("DefaultConnection") ?? "";
            var match = System.Text.RegularExpressions.Regex.Match(connectionString, @"Data Source=([^;]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (match.Success)
            {
                var dbPath = match.Groups[1].Value.Trim();
                var dir = Path.GetDirectoryName(dbPath);
                if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }
            }

            db.Database.Migrate();

            if (!db.Users.Any())
            {
                var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
                const string adminSalt = "!@#_$%^&aB12cD34";
                var adminHash = passwordHasher.HashPassword("admin", adminSalt);
                db.Users.Add(new Server.Domain.Entities.User(
                    id: Guid.Parse("00000000-0000-0000-0000-000000000001"),
                    name: "Administrador",
                    email: "admin",
                    passwordHash: adminHash,
                    passwordSalt: adminSalt,
                    createdAtUtc: DateTime.UtcNow
                ));
                db.SaveChanges();
            }
        }
        catch (Exception ex)
        {
            app.Logger.LogWarning(ex, "Could not apply database migrations on startup.");
        }

        app.MapAuthEndpoints();
        app.MapBillEndpoints();

        app.MapFallbackToFile("index.html");

        return app;
    }
}
