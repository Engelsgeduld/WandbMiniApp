import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const initializeTelegram = () => {
  const tg = window.Telegram.WebApp;
  tg.expand();
  tg.enableClosingConfirmation();
};

const Root = () => {
  useEffect(() => {
    initializeTelegram();
  }, []);

  return <App />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

