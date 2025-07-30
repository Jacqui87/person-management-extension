export interface PersonViewModel {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  department: number;
  role: number;
  email: string;
  password: string;
  cultureCode: string;
  biography?: string;
}
