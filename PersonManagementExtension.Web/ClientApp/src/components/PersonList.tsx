import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
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
