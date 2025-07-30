import axios from "axios";
import { PersonViewModel } from "../models/PersonViewModel";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/person`;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export class PersonService {
  async getAllPeople(): Promise<PersonViewModel[]> {
    const res = await axios.get<PersonViewModel[]>(BASE_URL, {
      headers: getAuthHeaders(),
      withCredentials: true,
    });
    return res.data;
  }

  async getById(id: number): Promise<PersonViewModel> {
    const res = await axios.get<PersonViewModel>(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
      withCredentials: true,
    });
    return res.data;
  }

  async add(person: PersonViewModel): Promise<void> {
    await axios.post(BASE_URL, person, {
      headers: getAuthHeaders(),
      withCredentials: true,
    });
  }

  async update(person: PersonViewModel): Promise<void> {
    await axios.put(`${BASE_URL}/${person.id}`, person, {
      headers: getAuthHeaders(),
      withCredentials: true,
    });
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
      withCredentials: true,
    });
  }
}
