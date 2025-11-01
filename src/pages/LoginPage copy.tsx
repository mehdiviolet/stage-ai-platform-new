import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { loginUser } from "../features/auth/authSlice";
import { useAppDispatch } from "../app/hooks";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const handleLogin = async function () {
    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      navigate("/chat");
    }
    console.log(result); //action
    console.log(result.payload); //action.payload
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 3 }}>
      <Typography variant="h4" mb={3}>
        Login
      </Typography>

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
      <Typography color="error" sx={{ mt: 1 }}>
        Errore: credenziali non valide
      </Typography>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleLogin}
      >
        Login
      </Button>

      {/* Loading state example */}
      {/* <Button
        fullWidth
        variant="contained"
        disabled
        sx={{ mt: 2 }}
      >
        <CircularProgress size={24} />
      </Button> */}
    </Box>
  );
}

export default LoginPage;
