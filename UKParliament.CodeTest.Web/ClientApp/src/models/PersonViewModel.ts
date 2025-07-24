export interface PersonViewModel {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  email: string;
  department: number;
  password: string;
  role: number;
  biography?: string;
}
