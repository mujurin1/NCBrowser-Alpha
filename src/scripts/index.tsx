import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { Button } from "@mui/material";
import { ChatMediation } from "./LiveCycle/ChatMediation";
import { DemoChatViewer } from "./__demo__/DemoChatViewer";
import { DemoLiveManager } from "./__demo__/DemoLiveManager";

import "../styles/index.css";

let auto = false;
function MainConponent() {
  const demoLiveManager = useMemo(
    () => new DemoLiveManager(ChatMediation),
    [ChatMediation]
  );

  useEffect(() => {
    setInterval(() => {
      if (auto) demoLiveManager.DEMO_createChat();
    }, 100);
  }, [demoLiveManager, auto]);

  return (
    <div>
      <div>
        <Button
          variant="contained"
          onClick={() => demoLiveManager.DEMO_createChat()}
        >
          追加
        </Button>
        <Button variant="contained" onClick={() => (auto = !auto)}>
          A
        </Button>
      </div>
      <DemoChatViewer tool={ChatMediation} />
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <MainConponent />
  </React.StrictMode>,
  document.getElementById("root")
);
