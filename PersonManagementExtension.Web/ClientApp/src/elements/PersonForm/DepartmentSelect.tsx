import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { PersonViewModel } from "../../models/PersonViewModel";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";
import { DepartmentViewModel } from "../../models/DepartmentViewModel";

interface DepartmentSelectProps {
  canEdit: boolean;
  departments: DepartmentViewModel[];
  formik: FormikProps<PersonViewModel & { confirmPassword: string }>;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DepartmentSelect = ({
  canEdit,
  formik,
  departments,
  handleFieldChange,
}: DepartmentSelectProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      select
      label={`${t("person_editor.department")} *`}
      name="department"
      fullWidth
      value={formik.values.department}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
      disabled={!canEdit}
      error={formik.touched.department && Boolean(formik.errors.department)}
      helperText={formik.touched.department && formik.errors.department}
    >
      {departments.map((dept) => (
        <MenuItem key={dept.id} value={dept.id}>
          {dept.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default DepartmentSelect;
