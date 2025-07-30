import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { PersonViewModel } from "../../models/PersonViewModel";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";
import { RoleViewModel } from "../../models/RoleViewModel";

interface RoleSelectProps {
  canEdit: boolean;
  roles: RoleViewModel[];
  formik: FormikProps<PersonViewModel & { confirmPassword: string }>;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RoleSelect = ({
  canEdit,
  formik,
  roles,
  handleFieldChange,
}: RoleSelectProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      select
      label={`${t("person_editor.role")} *`}
      name="role"
      fullWidth
      value={formik.values.role}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
      disabled={!canEdit}
      error={formik.touched.role && Boolean(formik.errors.role)}
      helperText={formik.touched.role && formik.errors.role}
    >
      {roles.map((role) => (
        <MenuItem key={role.id} value={role.id}>
          {role.type}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default RoleSelect;
