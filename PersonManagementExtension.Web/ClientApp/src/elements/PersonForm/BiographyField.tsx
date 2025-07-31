import TextField from "@mui/material/TextField";
import { PersonViewModel } from "../../models/PersonViewModel";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";

interface BiographyFieldProps {
  canEdit: boolean;
  formik: FormikProps<PersonViewModel & { confirmPassword: string }>;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BiographyField = ({
  canEdit,
  formik,
  handleFieldChange,
}: BiographyFieldProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t("person_editor.biography")}
      name="biography"
      fullWidth
      multiline
      rows={4}
      value={formik.values.biography}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
      disabled={!canEdit}
      error={formik.touched.biography && Boolean(formik.errors.biography)}
      helperText={formik.touched.biography && formik.errors.biography}
    />
  );
};

export default BiographyField;
