import { Box, Stack, Typography } from "@mui/material";

const item = [
  "onion",
  "tomato",
  "potato",
  "garlic",
  "letuce",
  "spinach",
  "cucumber",
  "kale",
];

export default function Home() {
  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Box width="800px" height="100px" bgcolor={"f0f0f0"}>
        <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
          Pantry Items
        </Typography>
      </Box>
      <Stack width="800px" height="600px" spacing={2} overflow={"auto"}>
        {item.map((i) => (
          <Box
            key={i}
            width="100%"
            height="100px"
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            bgcolor={"#f0f0f0"}
          >
            <Typography variant={"h3"} color={"#333"} textAlign={"center"}>
              {i.charAt(0).toUpperCase() + i.slice(1)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
