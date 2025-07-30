import { useState } from "react";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useTranslation } from "react-i18next";

type Props = {
  onLogin: (user: {
    email: string;
    password: string;
    token: string | null;
  }) => void;
  tokenInvalid: boolean;
};

const LoginScreen = ({ onLogin, tokenInvalid }: Props) => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      onLogin({
        password,
        email,
        token: localStorage.getItem("token"),
      });
    } catch (err) {
      setError(t("login.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 10 }}>
        <Typography variant="h5" gutterBottom>
          {t("login.login")}
        </Typography>

        {tokenInvalid && (
          <Typography
            color="error"
            variant="body2"
            sx={{ fontWeight: "bold", marginBottom: 2 }}
            role="alert"
            aria-live="assertive"
          >
            {t("common.invalid_credentials")}
          </Typography>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <TextField
            label={t("person_editor.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t("person_editor.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? t("login.logging_in") : t("login.login")}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginScreen;
