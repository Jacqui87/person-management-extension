import TextField from "@mui/material/TextField";
import { PersonViewModel } from "../../models/PersonViewModel";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";

interface DobFieldProps {
  canEdit: boolean;
  defaultDob: string;
  formik: FormikProps<PersonViewModel & { confirmPassword: string }>;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DobField = ({
  canEdit,
  defaultDob,
  formik,
  handleFieldChange,
}: DobFieldProps) => {
  const { t } = useTranslation();

  const today = new Date();
  const maxDate = today.toISOString().split("T")[0];

  return (
    <TextField
      label={`${t("person_editor.dob")} *`}
      type="date"
      name="dateOfBirth"
      value={formik.values.dateOfBirth ?? defaultDob}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
      InputLabelProps={{ shrink: true }}
      fullWidth
      disabled={!canEdit}
      error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
      helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
      inputProps={{
        max: maxDate,
      }}
    />
  );
};

export default DobField;
