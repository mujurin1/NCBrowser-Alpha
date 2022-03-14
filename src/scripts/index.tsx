import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { Button } from "@mui/material";
import { DemoLivePlatform } from "./__demo__/DemoLivePlatform";
import { LivePlatformManager } from "./LivePlatform/LivePlatformManager";
import { CommentView } from "./components/CommentView";

import "../styles/index.css";

let auto = false;

function MainConponent() {
  const demoLivePlatform = useMemo(() => new DemoLivePlatform(), []);
  useEffect(() => {
    LivePlatformManager.initialize(demoLivePlatform);
  }, []);

  useEffect(() => {
    setInterval(() => {
      if (auto) demoLivePlatform.newComment();
    }, 5);
  }, [demoLivePlatform, auto]);

  return (
    <div>
      <div>
        <Button
          variant="contained"
          onClick={() => demoLivePlatform.newComment()}
        >
          追加
        </Button>
        <Button variant="contained" onClick={() => (auto = !auto)}>
          A
        </Button>
      </div>
      <CommentView className="" width={600} height={700} />
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <MainConponent />
  </React.StrictMode>,
  document.getElementById("root")
);
