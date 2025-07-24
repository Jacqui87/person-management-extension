using UKParliament.CodeTest.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace UKParliament.CodeTest.Services;

public class PersonService(PersonManagerContext context, ILogger<PersonService> logger) : IPersonService
{
    public async Task<List<Person>> GetAllAsync()
    {
        try
        {
            return await context.People.ToListAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving all people.");
            return new List<Person>();
        }
    }

    public async Task<List<Department>> GetAllDepartmentsAsync()
    {
        try {
            return await context.Departments.ToListAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving all departments.");
            return new List<Department>();
        }
    }

    public async Task<Person?> GetByIdAsync(int id)
    {
        try
        {
            return await context.People.FindAsync(id);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving person with ID {Id}.", id);
            return null;
        }
    }

    public async Task<Person?> AddAsync(Person person)
    {
        try
        {
            var emailUnique = await IsEmailUniqueAsync(person.Email);
            if(emailUnique == false)
            {
                logger.LogWarning("Email {Email} is not unique.", person.Email);
                return null;
            }

            context.People.Add(person);
            await context.SaveChangesAsync();
            return person; // Includes generated ID
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error adding new person.");
            throw;
        }
    }

    public async Task<bool> UpdateAsync(int id, Person person)
    {
        try
        {
            var emailUnique = await IsEmailUniqueAsync(person.Email);
            if(emailUnique == false)
            {
                logger.LogWarning("Email {Email} is not unique.", person.Email);
                return false;
            }

            var updatePerson = await context.People.FindAsync(id);
            if (updatePerson == null) return false;

            updatePerson.FirstName = person.FirstName;
            updatePerson.LastName = person.LastName;
            updatePerson.Email = person.Email;
            updatePerson.Role = person.Role;
            updatePerson.Password = person.Password;
            updatePerson.Department = person.Department;
            updatePerson.DateOfBirth = person.DateOfBirth;

            await context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating person with ID {Id}.", id);
            return false;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            var person = await context.People.FindAsync(id);
            if (person == null) return false;

            if (person.Role == "admin")
            {
                logger.LogWarning("Attempted to delete admin user with ID {Id}.", id);
                return false;
            }

            context.People.Remove(person);
            await context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting person with ID {Id}.", id);
            return false;
        }
    }

    internal async Task<bool> IsEmailUniqueAsync(string email)
    {
        try
        {
            return !await context.People.AnyAsync(p => p.Email == email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking email uniqueness for {Email}.", email);
            return false;
        }
    }
}