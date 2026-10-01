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
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
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
        app.UseAuthentication();
        app.UseAuthorization();

        // Ensure database migrations are applied
        try
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.Migrate();
        }
        catch (Exception ex)
        {
            app.Logger.LogWarning(ex, "Could not apply database migrations on startup.");
        }

        app.MapAuthEndpoints();
        app.MapBillEndpoints();

        return app;
    }
}
