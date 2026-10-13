"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface EmbedContextType {
  isEmbed: boolean;
}

const EmbedContext = createContext<EmbedContextType>({ isEmbed: false });

export function useEmbed() {
  return useContext(EmbedContext);
}

export function EmbedProvider({
  children,
  initialEmbed = false,
}: {
  children: React.ReactNode;
  initialEmbed?: boolean;
}) {
  const [isEmbed, setIsEmbed] = useState(initialEmbed);

  useEffect(() => {
    // Check URL search parameter or iframe parent detection
    const params = new URLSearchParams(window.location.search);
    const paramEmbed = params.get("embed") === "1" || params.get("embed") === "true";
    const iframeEmbed = window.self !== window.top;

    if (paramEmbed || iframeEmbed) {
      setIsEmbed(true);
      document.documentElement.classList.add("atlas-embedded");
    }
  }, []);

  return (
    <EmbedContext.Provider value={{ isEmbed }}>
      {children}
    </EmbedContext.Provider>
  );
}

export function EmbedHidden({ children }: { children: React.ReactNode }) {
  const { isEmbed } = useEmbed();
  if (isEmbed) return null;
  return <>{children}</>;
}
