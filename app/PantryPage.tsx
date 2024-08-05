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
import { useEffect, useState, useRef } from "react";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { Camera, CameraType } from "react-camera-pro";
import axios from "axios";
import { Height } from "@mui/icons-material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "600px",
  height: "450px",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
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
  const [showCamera, setShowCamera] = useState(false);
  const [camera, setCamera] = useState(null);
  const cameraRef = useRef<CameraType | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setShowCamera(false);
  };

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

  const handleCameraCapture = async () => {
    if (cameraRef.current) {
      const photo = cameraRef.current.takePhoto();
      try {
        const response = await axios.post(
          "YOUR_AZURE_OPENAI_API_ENDPOINT",
          {
            image: photo,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer YOUR_AZURE_OPENAI_API_KEY",
            },
          }
        );

        // Assuming the API returns an object with an 'item' property
        const newItem = response.data.item;

        await addDoc(collection(firestore, "pantry"), {
          name: newItem,
          quantity: 1,
        });

        updatePantry();
        setShowCamera(false);
      } catch (error) {
        console.error("Error processing image:", error);
      }
    }
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const handleAddItem = async () => {
    if (itemName.trim() !== "") {
      const existingItem = pantry.find(
        (item) => item.name.toLowerCase() === itemName.trim().toLowerCase()
      );

      if (existingItem) {
        await updateDoc(doc(firestore, "pantry", existingItem.id), {
          quantity: existingItem.quantity + 1,
        });
        updatePantry();
      } else {
        await addDoc(collection(firestore, "pantry"), {
          name: itemName.trim(),
          quantity: 1,
        });
      }
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
            {!showCamera ? (
              <Stack
                width="100%"
                height="100%" // Make the Stack fill the modal
                direction="column"
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Add item
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ width: "60%" }} // Ensure this Stack takes the full width
                >
                  <TextField
                    id="outlined-basic"
                    label="Item"
                    variant="outlined"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    sx={{ flexGrow: 1 }} // Allow TextField to grow and fill available space
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddItem}
                    sx={{
                      borderColor: "#b83f45",
                      color: "#b83f45",
                      "&:hover": {
                        borderColor: "#9a3238",
                      },
                    }}
                  >
                    Add
                  </Button>
                </Stack>
                <Button
                  variant="contained"
                  onClick={() => setShowCamera(true)}
                  sx={{
                    backgroundColor: "#b83f45",
                    "&:hover": {
                      backgroundColor: "#9a3238",
                    },
                    mt: 2, // Add margin-top for spacing from previous elements
                  }}
                >
                  Add with Camera
                </Button>
              </Stack>
            ) : (
              <Stack
                width="100%"
                height="100%" // Make the Stack fill the modal
                direction="column"
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Capture Item
                </Typography>
                <Camera
                  ref={cameraRef}
                  errorMessages={{
                    noCameraAccessible:
                      "No camera device accessible. Please connect your camera or try a different browser.",
                    permissionDenied:
                      "Permission denied. Please refresh and give camera permission.",
                    switchCamera:
                      "It is not possible to switch camera to different one because there is only one video device accessible.",
                    canvas: "Canvas is not supported.",
                  }}
                  numberOfCamerasCallback={(i: number) => console.log(i)}
                  videoReadyCallback={() => console.log("Video feed ready.")}
                  facingMode="environment"
                />
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mt: 2 }} // Add margin-top for spacing from Camera
                >
                  <Button
                    variant="contained"
                    onClick={handleCameraCapture}
                    sx={{
                      backgroundColor: "#b83f45",
                      "&:hover": {
                        backgroundColor: "#9a3238",
                      },
                    }}
                  >
                    Capture and Add
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowCamera(false)}
                    sx={{
                      borderColor: "#b83f45",
                      color: "#b83f45",
                      "&:hover": {
                        borderColor: "#9a3238",
                      },
                    }}
                  >
                    Back to Manual Input
                  </Button>
                </Stack>
              </Stack>
            )}
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
            sx={{
              width: "100%",
              minHeight: "100px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "rgba(0, 0, 0, .003)",
              padding: "0 20px",
              border: "none",
              boxShadow: "inset 0 -2px 1px rgba(0, 0, 0, .03)",
              transition: "box-shadow 0.3s ease-in-out", // Smooth transition for the shadow change
              "&:hover": {
                boxShadow: "inset 0 -3px 2px rgba(0, 0, 0, .1)", // More pronounced shadow on hover
              },
              "&:active": {
                boxShadow: "inset 0 -4px 3px rgba(0, 0, 0, .15)", // Even more pronounced shadow when clicked
              },
            }}
          >
            <Typography variant="h3" color="#333" sx={{ fontSize: "2.45rem" }}>
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
