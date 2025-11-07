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
import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  appendLocalMessage,
  createConversation,
  getConversations,
  sendMessage,
  // sendMessage,
} from "../features/chat/chatSlice";
import { mediaApi } from "../features/chat/api";
// import { mediaApi } from "../features/chat/api";
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

type FileWithPreview = {
  file: File;
  preview: string; // URL temporaneo per anteprima
};

function ChatPage() {
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<FileWithPreview[]>([]);
  const { currentConversation, isLoading, error } = useAppSelector(
    (s) => s.chat
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   if (!currentConversation) {
  //     dispatch(
  //       createConversation({
  //         name: "nuova chat",
  //         model: "puyangwang/medgemma-27b-it:q6",
  //       })
  //     );
  //   }
  // }, []);

  // STEP 1: Add file in setAttachedFiles
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file), // 👈 Crea URL temporaneo
      }));
      console.log(newFiles);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
      e.target.value = "";
    }
  };

  //  // STEP 1.1: Rimuove file in setAttachedFiles
  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => {
      const fileToRemove = prev[index];
      URL.revokeObjectURL(fileToRemove.preview); // 👈 Libera memoria
      return prev.filter((_, i) => i !== index);
    });
  };

  const canSend = !!message;
  const handleSendMessage = async function () {
    if (!currentConversation) return;

    // STEP 1: Converti file in base64
    const mediaArray = await Promise.all(
      attachedFiles.map(async (item) => {
        console.log(item);

        return {
          base64: await fileToBase64(item.file),
          fileName: item.file.name,
          mimeType: item.file.type,
        };
      })
    );
    // const conv = dispatch(getConversations());
    console.log("HI....");
    console.log(mediaArray);

    // STEP 2: Aggiungi messaggio utente localmente (con anteprima temporanea)
    dispatch(
      appendLocalMessage({
        role: "user",
        content: message,
        media: attachedFiles.map((f) => ({
          preview: f.preview,
          fileName: f.file.name,
        })),
      })
    );

    setMessage("");
    setAttachedFiles([]);
    // STEP 3: Invia tutto al backend (che gestisce S3)
    await dispatch(
      sendMessage({
        id: currentConversation.id,
        message,
        media: mediaArray?.length > 0 ? mediaArray : undefined,
      })
    );

    // STEP 4: Cleanup
    attachedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    // console.log(conv);
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
                {msg.content && (
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </Typography>
                )}
              </Paper>

              {/* Mostra media */}
              {msg?.mediaUrls && msg?.mediaUrls.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                  {msg.mediaUrls.map((item, idx) => (
                    <img
                      key={idx}
                      src={item.preview}
                      alt={item.fileName}
                      style={{
                        maxWidth: 200,
                        maxHeight: 200,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </Box>
              )}
              {/* {attachedFiles && attachedFiles.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                  {attachedFiles.map((item, idx) => (
                    <img
                      key={idx}
                      src={item.preview}
                      alt={item.file.name}
                      style={{
                        maxWidth: 200,
                        maxHeight: 200,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </Box>
              )} */}
            </Box>
          );
        })}
        {/* Loading indicator */}
        {isLoading && (
          <Box sx={{ display: "flex", gap: 1, alignSelf: "flex-start" }}>
            <Avatar sx={{ bgcolor: "grey.400", width: 32, height: 32 }}>
              <SmartToyIcon fontSize="small" />
            </Avatar>
            <Paper elevation={2} sx={{ p: 1.5, bgcolor: "grey.100" }}>
              <Typography variant="body2" color="text.secondary">
                Sto pensando...
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>

      {/* Anteprima file allegati */}
      {attachedFiles.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {attachedFiles.map((item, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                width: 80,
                height: 80,
                borderRadius: 2,
                overflow: "hidden",
                border: "2px solid",
                borderColor: "primary.main",
              }}
            >
              {/* Thumbnail immagine */}
              <img
                src={item.preview}
                alt={item.file.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Pulsante X per rimuovere */}
              <IconButton
                size="small"
                onClick={() => handleRemoveFile(index)}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "rgba(0,0,0,0.6)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.8)",
                  },
                  width: 24,
                  height: 24,
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* Input area */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFileChange}
        />
        <IconButton
          color="default"
          onClick={() => fileInputRef.current?.click()}
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
