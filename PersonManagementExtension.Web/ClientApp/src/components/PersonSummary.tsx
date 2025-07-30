import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";

const PersonSummary = ({ isAdmin }: { isAdmin: boolean }) => {
  const { t } = useTranslation();

  return (
    <Box mt={3}>
      <Typography variant="h6">
        {isAdmin ? t("person_summary.isAdmin") : t("person_summary.isUser")}
      </Typography>
    </Box>
  );
};

export default PersonSummary;
