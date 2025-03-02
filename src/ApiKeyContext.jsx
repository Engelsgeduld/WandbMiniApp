import React, { createContext, useContext, useState } from "react";

const ApiKeyContext = createContext();

export const ApiKeyProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState(null);

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => useContext(ApiKeyContext);
