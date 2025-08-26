using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UniSanayi.Infrastructure.Persistence;

namespace UniSanayi.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var conn = config.GetConnectionString("Default");

        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(conn, b => b.MigrationsAssembly("UniSanayi.Infrastructure")));

        // ileride repository, unit of work, jwt/email vs. kayıtları da buraya gelecek
        return services;
    }
}
