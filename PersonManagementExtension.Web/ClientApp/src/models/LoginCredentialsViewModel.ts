import { PersonViewModel } from "./PersonViewModel";
import { SessionViewModel } from "./SessionViewModel";

export interface LoginCredentialsViewModel {
  session: SessionViewModel;
  user: PersonViewModel;
}
