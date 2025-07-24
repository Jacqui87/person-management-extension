using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using UKParliament.CodeTest.Data;
using UKParliament.CodeTest.Services;
using FluentValidation.AspNetCore;
using UKParliament.CodeTest.Web.ViewModels;
using UKParliament.CodeTest.Web.Auth;
using Microsoft.OpenApi.Models;

var myAllowSpecificOrigins = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var allowedClients = "http://localhost:3000".Split(',');
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins, policy =>
    {
        policy.WithOrigins(allowedClients).AllowCredentials().AllowAnyMethod().AllowAnyHeader();
    });
});

/*builder.Services
    .AddControllersWithViews()
    .AddFluentValidation(fv =>
    {
        fv.RegisterValidatorsFromAssemblyContaining<PersonViewModelValidator>();
    });*/

builder.Services.AddControllers();

// Add automatic validation and clientside adapters separately
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

builder.Services.AddDbContext<PersonManagerContext>(op =>
    op.UseInMemoryDatabase("PersonManager"));

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPersonService, PersonService>();

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
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Your API", Version = "v1" });

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

app.Run();