import {
  List,
  ListItemButton,
  ListItemText,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import { PersonViewModel } from "../models/PersonViewModel";

const PersonList = ({
  people,
  onSelect,
  onAddNew,
}: {
  people: PersonViewModel[];
  onSelect: (id: number) => void;
  onAddNew: () => void;
}) => (
  <Stack spacing={2}>
    <Typography variant="h6">People</Typography>
    <List>
      {people.map((p) => (
        <ListItemButton key={p.id} onClick={() => onSelect(p.id)}>
          <ListItemText
            primary={`${p.firstName} ${p.lastName}`}
            secondary={`email: ${p.email}`}
          />
        </ListItemButton>
      ))}
    </List>
    <Button variant="outlined" onClick={onAddNew}>
      Add Person
    </Button>
  </Stack>
);

export default PersonList;
