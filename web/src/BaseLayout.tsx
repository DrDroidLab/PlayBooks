import React from "react";
import { Outlet } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function BaseLayout() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#9554ff",
      },
      secondary: {
        main: "#11cb5f",
      },
    },
  });

  return (
    <main>
      <ThemeProvider theme={theme}>
        <Outlet />
      </ThemeProvider>
    </main>
  );
}

export default BaseLayout;
