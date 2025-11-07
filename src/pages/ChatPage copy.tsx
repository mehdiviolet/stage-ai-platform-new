import {
  Avatar,
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  appendLocalMessage,
  createConversation,
  sendMessage,
} from "../features/chat/chatSlice";
import { mediaApi } from "../features/chat/api";

// Helper: converte File in stringa base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result); // già in formato "data:image/png;base64,..."
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

type FileWithPreview = {
  file: File;
  preview: string;
};

function ChatPage() {
  const dispatch = useAppDispatch();
  const { currentConversation, loading, error } = useAppSelector((s) => s.chat);
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<FileWithPreview[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const canSend =
    (message.trim().length > 0 || attachedFiles.length > 0) && !loading;

  useEffect(() => {
    if (!currentConversation) {
      dispatch(
        createConversation({
          name: "nuova chat",
          model: "puyangwang/medgemma-27b-it:q6",
        })
      );
    }
  }, []);

  const handleSendMessage = async function () {
    if (!message.trim() || loading || !currentConversation) return;

    // 🆕 STEP 1: Carica file su S3 PRIMA di inviare il messaggio
    const uploadedUrls: string[] = [];

    if (attachedFiles.length > 0) {
      try {
        for (const item of attachedFiles) {
          const base64 = await fileToBase64(item.file);

          const uploadResponse = await mediaApi.uploadMedia({
            base64,
            fileName: item.file.name,
            mimType: item.file.type,
          });

          uploadedUrls.push(uploadResponse.data.url);
        }
      } catch (err) {
        console.error("Error upload media", err);
        // return;
      }
    }
    // 🆕 STEP 2: Aggiungi messaggio utente localmente CON gli URL S3

    dispatch(
      appendLocalMessage({
        role: "user",
        content: message,
        mediaUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      })
    );

    const mediaArray = await Promise.all(
      attachedFiles.map(async (item) => {
        const base64 = await fileToBase64(item.file);
        return {
          base64,
          filename: item.file.name,
          mimeType: item.file.type,
        };
      })
    );
    setMessage("");
    const result = await dispatch(
      sendMessage({
        conversationId: currentConversation?.id,
        message,
        media: mediaArray.length > 0 ? mediaArray : undefined,
      })
    );

    setAttachedFiles([]);

    console.log(result);
    return result;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 200px)",
      }}
    >
      {/* Area messaggi scrollabile */}
      <Paper
        elevation={1}
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
          mb: 2,
          bgcolor: "background.default",
        }}
      >
        {/* Empty state */}
        {currentConversation?.messages.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>
            <SmartToyIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6">Nessun messaggio ancora</Typography>
            <Typography variant="body2">Inizia una conversazione!</Typography>
          </Box>
        )}

        {currentConversation?.messages.map((msg) => {
          return (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                gap: 1,
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "70%",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: msg.role === "user" ? "primary.main" : "grey.400",
                  width: 32,
                  height: 32,
                }}
              >
                {msg.role === "user" ? (
                  <PersonIcon fontSize="small" />
                ) : (
                  <SmartToyIcon fontSize="small" />
                )}
              </Avatar>
              <Paper
                elevation={2}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor:
                    msg.role === "user" ? "primary.main" : "background.paper",
                  color:
                    msg.role === "user"
                      ? "primary.contrastText"
                      : "text.primary",
                }}
              >
                {/* {msg.mediaUrls} */}
                {msg.content && (
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </Typography>
                )}
              </Paper>
            </Box>
          );
        })}
        {/* Loading indicator */}
        {loading && (
          <Box sx={{ display: "flex", gap: 1, alignSelf: "flex-start" }}>
            <Avatar sx={{ bgcolor: "grey.400", width: 32, height: 32 }}>
              <SmartToyIcon fontSize="small" />
            </Avatar>
            <Paper elevation={2} sx={{ p: 1.5, bgcolor: "grey.100" }}>
              <Typography variant="body2" color="text.secondary">
                Sto scrivendo...
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>
      {/* Input area */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton
          color="default"
          onClick={handleAttachClick}
          size="large"
          title="Allega file"
        >
          <AttachFileIcon />
        </IconButton>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Scrivi un messaggio..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <IconButton
          color="primary"
          size="large"
          onClick={handleSendMessage}
          disabled={!canSend}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default ChatPage;
