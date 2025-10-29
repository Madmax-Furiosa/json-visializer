import { ReactFlowProvider } from "@xyflow/react";
import LayoutFlow from "./components/Flow";
function App() {
  return (
    <>
      <ReactFlowProvider>
        <LayoutFlow />
      </ReactFlowProvider>
    </>
  );
}

export default App;
