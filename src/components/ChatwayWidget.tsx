import { useEffect } from "react";

const SCRIPT_ID = "chatway";
const CHATWAY_SRC = "https://cdn.chatway.app/widget.js?id=CkU1lAskoiDm";

export function ChatwayWidget() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = CHATWAY_SRC;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
