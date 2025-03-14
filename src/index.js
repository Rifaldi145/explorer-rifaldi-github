import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import TestGithubSeacrhUser from "./App";

const theme = extendTheme({});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ChakraProvider theme={theme}>
    <TestGithubSeacrhUser />
  </ChakraProvider>
);
