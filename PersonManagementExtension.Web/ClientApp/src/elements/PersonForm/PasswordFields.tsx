import TextField from "@mui/material/TextField";
import useTheme from "@mui/material/styles/useTheme";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PersonViewModel } from "../../models/PersonViewModel";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";

interface PasswordFieldsProps {
  canEdit: boolean;
  passwordChanged: boolean;
  formik: FormikProps<PersonViewModel & { confirmPassword: string }>;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordFields = ({
  canEdit,
  formik,
  passwordChanged,
  handleFieldChange,
}: PasswordFieldsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <TextField
        label={
          <Box display="flex" alignItems="center" gap={0.5}>
            {t("person_editor.password")} *
            <Tooltip
              title={
                <span style={{ whiteSpace: "pre-line", fontSize: 12 }}>
                  {t("person_editor.password_rules")}:{"\n"}-{" "}
                  {t("person_editor.at_least_x_chars", {
                    amount: 8,
                  })}
                  {"\n"}- {t("person_editor.at_least_1_uppercase_letter")}
                  {"\n"}- {t("person_editor.at_least_1_lowercase_letter")}
                  {"\n"}- {t("person_editor.at_least_1_number")}
                  {"\n"}- {t("person_editor.at_least_1_special_char")}
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
        name="password"
        type="password"
        fullWidth
        value={formik.values.password}
        onChange={handleFieldChange}
        onBlur={formik.handleBlur}
        disabled={!canEdit}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        autoComplete="new-password"
      />

      {passwordChanged && formik.touched.password && (
        <TextField
          label={t("person_editor.confirm_password")}
          name="confirmPassword"
          type="password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.confirmPassword &&
            Boolean(formik.errors.confirmPassword)
          }
          helperText={
            formik.touched.confirmPassword && formik.errors.confirmPassword
          }
        />
      )}
    </>
  );
};

export default PasswordFields;
