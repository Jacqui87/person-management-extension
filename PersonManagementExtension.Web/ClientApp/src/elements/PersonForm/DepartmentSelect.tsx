import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { PersonViewModel } from "../../models/PersonViewModel";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";
import { useDepartments } from "../../hooks/useDepartmentHooks";
import { Box, CircularProgress } from "@mui/material";

interface DepartmentSelectProps {
  canEdit: boolean;
  formik: FormikProps<PersonViewModel & { confirmPassword: string }>;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DepartmentSelect = ({
  canEdit,
  formik,
  handleFieldChange,
}: DepartmentSelectProps) => {
  const { t } = useTranslation();
  const { data: departments, isLoading } = useDepartments();

  return (
    <>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
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
          {departments?.map((dept) => (
            <MenuItem key={dept.id} value={dept.id}>
              {dept.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    </>
  );
};

export default DepartmentSelect;
