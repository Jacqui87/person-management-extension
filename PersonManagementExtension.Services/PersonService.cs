using PersonManagementExtension.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PersonManagementExtension.Services.Dtos;

namespace PersonManagementExtension.Services;

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

    public async Task<ServiceResult<Person?>> AddAsync(Person person)
    {
        try
        {
            if (person.Id > 0)
            {
                logger.LogWarning("New person must not have an ID.");
                return new ServiceResult<Person?>
                {
                    StatusCode = StatusCodes.Success,
                    Data = null
                };
            }

            var emailUnique = await IsEmailUniqueAsync(person.Id, person.Email);
            if (emailUnique == false)
            {
                logger.LogWarning("Email {Email} is not unique.", person.Email);
                return new ServiceResult<Person?>
                {
                    StatusCode = StatusCodes.Success,
                    Data = null
                };
            }

            context.People.Add(person);
            await context.SaveChangesAsync();

            return new ServiceResult<Person?>
            {
                StatusCode = StatusCodes.Success,
                Data = person
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error adding new person.");
            return new ServiceResult<Person?>
            {
                StatusCode = StatusCodes.Error,
                Data = person
            };
        }
    }

    public async Task<ServiceResult<bool>> UpdateAsync(int id, Person person)
    {
        try
        {
            if (id <= 0 || id != person.Id)
            {
                logger.LogWarning("ID must match and be greater than 0.");
                return new ServiceResult<bool>
                {
                    StatusCode = StatusCodes.Success,
                    Data = false
                };
            }

            var emailUnique = await IsEmailUniqueAsync(person.Id, person.Email);
            if (emailUnique == false)
            {
                logger.LogWarning("Email {Email} is not unique.", person.Email);
                return new ServiceResult<bool>
                {
                    StatusCode = StatusCodes.Success,
                    Data = false
                };
            }

            var updatePerson = await context.People.FindAsync(id);
            if (updatePerson == null)
            {
                return new ServiceResult<bool>
                {
                    StatusCode = StatusCodes.Success,
                    Data = false
                };
            }

            updatePerson.FirstName = person.FirstName;
            updatePerson.LastName = person.LastName;
            updatePerson.DateOfBirth = person.DateOfBirth;
            updatePerson.Email = person.Email;
            updatePerson.CultureCode = person.CultureCode;
            updatePerson.Password = person.Password;
            updatePerson.Role = person.Role;
            updatePerson.Department = person.Department;
            updatePerson.Biography = person.Biography;

            await context.SaveChangesAsync();
            return new ServiceResult<bool>
            {
                StatusCode = StatusCodes.Success,
                Data = true
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating person with ID {Id}.", id);
            return new ServiceResult<bool>
            {
                StatusCode = StatusCodes.Success,
                Data = false
            };
        }
    }

    public async Task<bool> DeleteAsync(int id, int? currentUserId)
    {
        try
        {
            if(currentUserId == null) return false;

            var person = await context.People.FindAsync(id);
            if (person == null) return false;

            if (person.Role == (int)Roles.Admin && id == currentUserId)
            {
              logger.LogWarning("Attempted to delete current admin user with ID {Id}.", id);
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

    internal async Task<bool> IsEmailUniqueAsync(int? excludingPersonId, string email)
    {
      if (excludingPersonId.HasValue)
      {
        return !await context.People.AnyAsync(p => p.Email == email && p.Id != excludingPersonId.Value);
      }
      else
      {
        return !await context.People.AnyAsync(p => p.Email == email);
      }
    }
}