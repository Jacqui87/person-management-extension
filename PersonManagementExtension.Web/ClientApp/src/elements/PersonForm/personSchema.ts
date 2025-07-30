import * as Yup from "yup";
import { ADMIN_ROLE_ID } from "../../constants/roles";
import type { TFunction } from "i18next";

export const personSchema = (
  t: TFunction,
  userRole: number | undefined,
  passwordChanged: boolean
) => {
  const formSchema = Yup.object({
    firstName: Yup.string()
      .required(t("person_editor.first_name_required"))
      .max(50, t("person_editor.first_name_invalid")),
    lastName: Yup.string()
      .required(t("person_editor.last_name_required"))
      .max(50, t("person_editor.last_name_invalid")),
    dateOfBirth: Yup.string()
      .required(t("person_editor.dob_name_required"))
      .matches(/^\d{4}-\d{2}-\d{2}$/, t("person_editor.dob_name_invalid")),
    email: Yup.string()
      .required(t("person_editor.email"))
      .email(t("person_editor.email_invalid"))
      .test("strict-domain", t("person_editor.email_rules"), (value) => {
        if (!value) return false;
        const [localPart, domain] = value.split("@");
        if (!localPart || !domain) return false;

        // Check domain contains at least one dot and valid domain format
        if (!/\.[a-zA-Z]{2,}$/.test(domain)) return false;

        // Optional: Additional character restrictions on local and domain parts
        // Basic regex for allowed characters in local part (simplified)
        const localValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart);
        // Basic regex for allowed characters in domain part
        const domainValid = /^[a-zA-Z0-9.-]+$/.test(domain);

        return localValid && domainValid;
      }),
    password: Yup.string().test(
      "password-strength-if-changed",
      t("person_editor.password_invalid"),
      (value) => {
        if (passwordChanged) {
          if (!value) return false;

          const minLength = value.length >= 8;
          const hasUppercase = /[A-Z]/.test(value);
          const hasLowercase = /[a-z]/.test(value);
          const hasNumber = /\d/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

          return (
            minLength &&
            hasUppercase &&
            hasLowercase &&
            hasNumber &&
            hasSpecialChar
          );
        }
        return true; // skip if password not changed
      }
    ),
    confirmPassword: passwordChanged
      ? Yup.string()
          .oneOf(
            [Yup.ref("password")],
            t("person_editor.passwords_do_not_match")
          )
          .required(t("person_editor.confirm_password_required"))
      : Yup.string().notRequired(),
    biography: Yup.string().max(500, t("person_editor.biography_invalid")),
    cultureCode: Yup.string()
      .oneOf(["en-GB", "cy-GB"])
      .required(t("person_editor.language_required")),
    department:
      userRole === ADMIN_ROLE_ID
        ? Yup.number().required(t("person_editor.department_required"))
        : Yup.number().notRequired(),
    role:
      userRole === ADMIN_ROLE_ID
        ? Yup.number().required(t("person_editor.role_required"))
        : Yup.number().notRequired(),
  });

  return {
    formSchema: formSchema,
  };
};
