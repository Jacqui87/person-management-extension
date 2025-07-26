import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

type Status = "success" | "failed" | "warning" | "info" | "closed" | string;

interface ActionSnackbarProps {
  status?: Status;
  handleClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
  successText?: string;
  failedText?: string;
  warningText?: string;
  informationText?: string;
}

const ActionSnackbar: React.FC<ActionSnackbarProps> = ({
  status = "closed",
  handleClose,
  successText = "",
  failedText = "",
  warningText = "",
  informationText = "",
}) => {
  // Determine severity for the Alert component
  const severity =
    status === "success"
      ? "success"
      : status === "failed"
      ? "error"
      : status === "info"
      ? "info"
      : "warning";

  // Determine message to display
  const message =
    status === "success"
      ? successText
      : status === "failed"
      ? failedText
      : status === "info"
      ? informationText
      : warningText;

  // Determine if snackbar should be open
  const open =
    status === "success" ||
    status === "failed" ||
    status === "info" ||
    status !== "closed";

  return (
    <Snackbar
      data-testid="action-snackbar"
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ActionSnackbar;
