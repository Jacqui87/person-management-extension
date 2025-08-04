import {
  faUser,
  faUserPlus,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

interface RoleIconProps {
  roleId: number;
}

const RoleIcon = ({ roleId }: RoleIconProps) => {
  const { t } = useTranslation();

  let icon;
  let tooltip;

  switch (roleId) {
    case 0:
      icon = faUserSlash;
      tooltip = "common.disabled";
      break;
    case 1:
      icon = faUser;
      tooltip = "search_bar.user";
      break;
    default:
      icon = faUserPlus;
      tooltip = "search_bar.admin";
  }

  return (
    <Tooltip title={t(tooltip)}>
      <FontAwesomeIcon icon={icon} style={{ marginLeft: "0.5rem" }} />
    </Tooltip>
  );
};

export default RoleIcon;
