"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type IntroContextValue = {
  /** true once the intro has finished (or was skipped / not shown) */
  ready: boolean;
  setReady: (ready: boolean) => void;
};

const IntroContext = createContext<IntroContextValue>({ ready: true, setReady: () => {} });

/**
 * The intro plays once per full page load. Client-side navigation back to the
 * home page (e.g. from a project page) does not replay it.
 */
export const introSession = { played: false };

export function IntroProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  return <IntroContext.Provider value={{ ready, setReady }}>{children}</IntroContext.Provider>;
}

export const useIntro = () => useContext(IntroContext);
