import { Box, Stack } from "@mui/material";

const item = ["onion", "tomato", "potato", "garlic"];

export default function Home() {
  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Stack width="800px" height="600px" spacing={2}>
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
            {i}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
