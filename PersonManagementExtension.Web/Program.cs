using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using PersonManagementExtension.Data;
using PersonManagementExtension.Services;
using FluentValidation.AspNetCore;
using PersonManagementExtension.Web.Auth;
using Microsoft.OpenApi.Models;

var localhost = "http://localhost:3000,https://localhost:7048,http://localhost:4173,http://localhost:4174";
var myAllowSpecificOrigins = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var allowedClients = localhost.Split(',');
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins, policy =>
    {
        policy.WithOrigins(allowedClients).AllowCredentials().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllersWithViews();

builder.Services.AddFluentValidationAutoValidation();        // Enables automatic model validation via FluentValidation
builder.Services.AddFluentValidationClientsideAdapters();    // (Optional) Enables client-side validation integration if needed

builder.Services.AddDbContext<PersonManagerContext>(op =>
    op.UseInMemoryDatabase("PersonManager"));

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPersonService, PersonService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = "Session";
        options.DefaultChallengeScheme = "Session";
    })
    .AddScheme<AuthenticationSchemeOptions, SessionAuthHandler>("Session", null);

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Person management API", Version = "v1" });

    // Define the BearerAuth scheme
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using Bearer scheme. Enter the token without 'Bearer ' prefix.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    // Apply BearerAuth globally to all endpoints (or specify per endpoint)
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Id = "Bearer",
                    Type = ReferenceType.SecurityScheme
                }
            },
            new string[] { }
        }
    });
});

var app = builder.Build();

// Seed DB
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<PersonManagerContext>();
    context.Database.EnsureCreated();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors(myAllowSpecificOrigins);  // CORS must be after routing, before auth

app.UseAuthentication();               // Authenticate after CORS
app.UseAuthorization();                // Authorize after authentication

app.Use(async (context, next) =>
{
    foreach (var header in context.Request.Headers)
    {
        Console.WriteLine($"{header.Key}: {header.Value}");
    }
    await next();
});

app.MapControllers();

app.MapFallbackToFile("index.html");

var serverAddressesFeature = app.Services.GetRequiredService<Microsoft.AspNetCore.Hosting.Server.IServer>()
    .Features.Get<Microsoft.AspNetCore.Hosting.Server.Features.IServerAddressesFeature>();

if (serverAddressesFeature != null && serverAddressesFeature.Addresses.Any())
{
  Console.WriteLine("Listening on addresses:");
  foreach (var address in serverAddressesFeature.Addresses)
  {
    Console.WriteLine(address);
  }
}

app.Run();