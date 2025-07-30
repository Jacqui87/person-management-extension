import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import { PersonViewModel } from "../../models/PersonViewModel";
import useTheme from "@mui/material/styles/useTheme";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";

interface FirstnameFieldProps {
  canEdit: boolean;
  formik: FormikProps<PersonViewModel & { confirmPassword: string }>;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FirstnameField = ({
  canEdit,
  formik,
  handleFieldChange,
}: FirstnameFieldProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <TextField
      label={
        <Box display="flex" alignItems="center" gap={0.5}>
          {t("person_editor.first_name")} *
          <Tooltip
            title={
              <span style={{ whiteSpace: "pre-line", fontSize: 12 }}>
                {t("person_editor.first_name_rules")}:{"\n"}-{" "}
                {t("person_editor.required")}
                {"\n"}-{" "}
                {t("person_editor.no_more_than_x_chars", {
                  amount: 50,
                })}
              </span>
            }
            arrow
            placement="right"
          >
            <FontAwesomeIcon
              icon={faInfoCircle}
              style={{
                color: theme.palette.info.main,
                cursor: "pointer",
              }}
            />
          </Tooltip>
        </Box>
      }
      name="firstName"
      value={formik.values.firstName}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
      fullWidth
      disabled={!canEdit}
      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
      helperText={formik.touched.firstName && formik.errors.firstName}
    />
  );
};

export default FirstnameField;
