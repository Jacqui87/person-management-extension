using UKParliament.CodeTest.Data;
using UKParliament.CodeTest.Services.Dtos;

namespace UKParliament.CodeTest.Services;

public interface IPersonService
{
    Task<List<Person>> GetAllAsync();
    Task<List<Department>> GetAllDepartmentsAsync();
    Task<List<Role>> GetAllRolesAsync();
    Task<Person?> GetByIdAsync(int id);
    Task<ServiceResult<Person?>> AddAsync(Person person);
    Task<ServiceResult<bool>> UpdateAsync(int id, Person person);
    Task<bool> DeleteAsync(int id, int? currentUserId);
}