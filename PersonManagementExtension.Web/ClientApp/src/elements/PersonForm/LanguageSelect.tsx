import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { PersonViewModel } from "../../models/PersonViewModel";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";

interface EmailFieldProps {
  canEdit: boolean;
  formik: FormikProps<PersonViewModel & { confirmPassword: string }>;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LanguageSelect = ({
  canEdit,
  formik,
  handleFieldChange,
}: EmailFieldProps) => {
  const { t } = useTranslation();

  const languageOptions = [
    { value: "en-GB", labelKey: "languages.en_GB" },
    { value: "cy-GB", labelKey: "languages.cy_GB" },
  ];

  return (
    <TextField
      select
      label={t("person_editor.language")}
      name="cultureCode"
      fullWidth
      value={formik.values.cultureCode || "en-GB"}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
      disabled={!canEdit}
      error={formik.touched.cultureCode && Boolean(formik.errors.cultureCode)}
      helperText={formik.touched.cultureCode && formik.errors.cultureCode}
    >
      {languageOptions.map(({ value, labelKey }) => (
        <MenuItem key={value} value={value}>
          {t(labelKey)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default LanguageSelect;
