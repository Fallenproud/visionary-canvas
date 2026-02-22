import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | AIKO`;
    return () => {
      document.title = "AIKO";
    };
  }, [title]);
}
