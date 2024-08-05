// components/PantryPage.tsx
"use client";

import { firestore } from "@/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
} from "@firebase/firestore";
import {
  Box,
  Button,
  Chip,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";

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

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(5),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
}

const PantryPage = () => {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantryList: PantryItem[] = [];
    docs.forEach((doc) => {
      pantryList.push({
        id: doc.id,
        name: doc.data().name,
        quantity: doc.data().quantity || 1,
      });
    });
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const handleAddItem = async () => {
    if (itemName.trim() !== "") {
      await addDoc(collection(firestore, "pantry"), {
        name: itemName.trim(),
        quantity: 1,
      });
      setItemName("");
      handleClose();
      updatePantry();
    }
  };

  const handleDeleteItem = async (id: string) => {
    await deleteDoc(doc(firestore, "pantry", id));
    updatePantry();
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      await updateDoc(doc(firestore, "pantry", id), { quantity: newQuantity });
      updatePantry();
    } else {
      handleDeleteItem(id);
    }
  };

  const filteredPantry = pantry.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Typography
        variant="h1"
        sx={{
          fontSize: "80px",
          fontWeight: 200,
          color: "#b83f45",
          textAlign: "center",
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          WebkitTextRendering: "optimizeLegibility",
          MozTextRendering: "optimizeLegibility",
          textRendering: "optimizeLegibility",
        }}
      >
        Pantry Items
      </Typography>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mb={2}
        sx={{
          "& .MuiChip-root": {
            borderColor: "#b83f45",
            color: "#b83f45",
          },
        }}
      >
        <Chip
          label={`Total Items: ${pantry.reduce(
            (sum, item) => sum + item.quantity,
            0
          )}`}
          color="primary"
          variant="outlined"
        />
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Search>
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
                id="outlined-basic"
                label="Item"
                variant="outlined"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={handleAddItem}
                sx={{
                  borderColor: "#b83f45",
                  color: "#b83f45",
                  "&:hover": {
                    borderColor: "#9a3238", // slightly darker shade for hover effect
                  },
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{
            backgroundColor: "#b83f45",
            "&:hover": {
              backgroundColor: "#9a3238", // slightly darker shade for hover effect
            },
          }}
        >
          Add
        </Button>
      </Box>

      <Stack width="800px" height="600px" spacing={2} overflow="auto">
        {filteredPantry.map((item) => (
          <Box
            key={item.id}
            width="100%"
            minHeight="100px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bgcolor="#f0f0f0"
            padding="0 20px"
          >
            <Typography variant="h3" color="#333">
              {item.name
                ? item.name.charAt(0).toUpperCase() + item.name.slice(1)
                : "Unnamed Item"}
            </Typography>
            <Box display="flex" alignItems="center">
              <Button
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              >
                -
              </Button>
              <Typography variant="h6" sx={{ mx: 2 }}>
                {item.quantity}
              </Typography>
              <Button
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                +
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDeleteItem(item.id)}
                sx={{ ml: 2 }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default PantryPage;
