namespace UKParliament.CodeTest.Services.Dtos;

public class ServiceResult<T>
{
    public T? Data { get; set; }
    public StatusCodes StatusCode { get; set; }
}