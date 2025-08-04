import { useMemo } from "react";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { PersonViewModel } from "../../models/PersonViewModel";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";
import { useRoles } from "../../hooks/useRoleHooks";
import { Box, CircularProgress } from "@mui/material";
import RoleIcon from "./RoleIcon";

const UserText = styled("div")(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

interface RoleSelectProps {
  canEdit: boolean;
  formik: FormikProps<PersonViewModel & { confirmPassword: string }>;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RoleSelect = ({
  canEdit,
  formik,
  handleFieldChange,
}: RoleSelectProps) => {
  const { t } = useTranslation();
  const { data: roles, isLoading } = useRoles();

  const roleOptions = useMemo(
    () => [{ id: 0, type: t("common.disabled") }, ...(roles ?? [])],
    [roles, t]
  );

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
          {roleOptions?.map((role) => {
            return (
              <MenuItem key={role.id} value={role.id}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
                  width="100%"
                >
                  <RoleIcon roleId={role.id} />
                  <UserText>{role.type}</UserText>
                </Box>
              </MenuItem>
            );
          })}
        </TextField>
      )}
    </>
  );
};

export default RoleSelect;
