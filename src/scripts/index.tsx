import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { Button } from "@mui/material";

import "../styles/index.css";
import { DemoLivePlatform } from "./__demo__/DemoLivePlatform";
import { LivePlatformManager } from "./LivePlatform/LivePlatformManager";
import { CommentView } from "./components/CommentView";

let auto = false;
function MainConponent() {
  const demoLivePlatform = useMemo(() => new DemoLivePlatform(), []);
  const livePlatformManager = useMemo(
    () => new LivePlatformManager(demoLivePlatform),
    []
  );

  useEffect(() => {
    setInterval(() => {
      if (auto) demoLivePlatform.newComment();
    }, 500);
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
      <CommentView livePlatformManager={livePlatformManager} />
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <MainConponent />
  </React.StrictMode>,
  document.getElementById("root")
);
