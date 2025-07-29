import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const PersonSummary = ({ isAdmin }: { isAdmin: boolean }) => (
  <Box mt={3}>
    <Typography variant="h6">
      {isAdmin
        ? "Select a person from the list or click 'Add Person' to begin."
        : "You are logged in - view or edit your own details."}
    </Typography>
  </Box>
);

export default PersonSummary;
