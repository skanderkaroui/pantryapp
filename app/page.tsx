"use client";

import { firestore } from "@/firebase";
import { collection, getDocs, query } from "@firebase/firestore";
import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function Home() {
  const [pantry, setPantry] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [itemName, setItemName] = useState("");

  useEffect(() => {
    const updatePantry = async () => {
      const snapshot = query(collection(firestore, "pantry"));
      const docs = await getDocs(snapshot);
      const pantryList: string[] = [];
      docs.forEach((doc) => {
        pantryList.push(doc.id);
      });
      console.log(pantryList);
      setPantry(pantryList);
    };
    updatePantry();
  }, []);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add item
          </Typography>
          <Stack width="100%" direction={"row"} spacing={2}>
            <TextField
              id="outined-basic"
              label="Item"
              variant="outlined"
            ></TextField>
            <Button variant="contained">Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Box
        width="800px"
        height="100px"
        bgcolor="#ADD8E6"
        display="flex"
        justifyContent="center"
        alignItems="center"
        border="1px solid #333"
      >
        <Typography variant="h2" color="#333" textAlign="center">
          Pantry Items
        </Typography>
      </Box>
      <Stack width="800px" height="600px" spacing={2} overflow="auto">
        {pantry.map((item) => (
          <Box
            key={item}
            width="100%"
            minHeight="100px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="#f0f0f0"
          >
            <Typography variant="h3" color="#333" textAlign="center">
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
