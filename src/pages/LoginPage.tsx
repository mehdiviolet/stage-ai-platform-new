import { Password } from "@mui/icons-material";
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { clearError, logUser, registerUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [registerOpened, setRegisterOpened] = useState(false);
  // const [registerOpened, setOpenRegister] = useState(false);
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const opneRegister = function () {
    setRegisterOpened(!registerOpened);
  };

  const openAccedi = function () {
    setRegisterOpened(!registerOpened);
  };

  const handleLogin = async () => {
    const result = await dispatch(logUser({ email, password }));
    console.log(result);
    if (logUser.fulfilled.match(result)) {
      // ← Meglio: type-safe!

      navigate("/chat");
    }
  };

  const handleRegister = async () => {
    // navigate("/auth/");
    const result = await dispatch(registerUser({ email, password, fullName }));
    console.log(result);
    setRegisterOpened(true);
  };

  useEffect(() => {
    dispatch(clearError());
  }, [email, password, fullName]);

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 3 }}>
      {registerOpened ? (
        <Typography variant="h4" mb={3}>
          Register
        </Typography>
      ) : (
        <Typography variant="h4" mb={3}>
          Accedi
        </Typography>
      )}

      {registerOpened && (
        <TextField
          fullWidth
          label="Nome completo"
          margin="normal"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      )}

      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        fullWidth
        type="password"
        label="Password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Error message example */}
      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {registerOpened ? (
        <>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleRegister}
          >
            Registrati
          </Button>
          <p>Hai già un account? </p>
          <Button variant="contained" sx={{ mt: 2 }} onClick={openAccedi}>
            Accedi
          </Button>
        </>
      ) : (
        <>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleLogin}
          >
            Accedi
          </Button>

          <p>Non hai un account? </p>
          <Button variant="contained" sx={{ mt: 2 }} onClick={opneRegister}>
            Registrati
          </Button>
        </>
      )}
    </Box>
  );
}

export default LoginPage;
