using PersonManagementExtension.Data;
using PersonManagementExtension.Services.Dtos;

namespace PersonManagementExtension.Services;

public interface IPersonService
{
    Task<List<Person>> GetAllAsync();
    Task<Person?> GetByIdAsync(int id);
    Task<ServiceResult<Person?>> AddAsync(Person person);
    Task<ServiceResult<bool>> UpdateAsync(int id, Person person);
    Task<bool> DeleteAsync(int id, int? currentUserId);
}