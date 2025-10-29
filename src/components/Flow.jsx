/* eslint-disable react-hooks/exhaustive-deps */
import ELK from "elkjs/lib/elk.bundled.js";
import React, { useCallback, useState } from "react";
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MiniMap,
  Controls,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import RotatingText from "./TextRotate";
import { Search } from "lucide-react";
// import { initialEdges, initialNodes } from "./InitialNodes";

const elk = new ELK();
const elkOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
};

const getLayoutedElements = (nodes, edges, options = {}) => {
  const isHorizontal = options?.["elk.direction"] === "RIGHT";
  const graph = {
    id: "root",
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      width: 150,
      height: 50,
    })),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        position: { x: node.x, y: node.y },
      })),

      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

let nodeId = 0;

const generateNodesAndEdges = (data, parentId = null, label = "data") => {
  const nodes = [];
  const edges = [];

  const createNode = (label, value) => {
    const id = `${++nodeId}`;
    nodes.push({
      id,
      data: { label: String(label) },
      position: { x: 0, y: 0 },
      style: {
        background: "#8ED1FC",
        borderRadius: 8,
        padding: 10,
        color: "#fff",
        border: "1px solid #3B82F6",
        fontWeight: 700,
        fontSize: "16px",
      },
    });

    if (parentId) {
      edges.push({
        id: `e${parentId}-${id}`,
        source: parentId,
        target: id,
        animated: true,
        type: "smoothstep",
      });
    }

    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v, idx) => {
          const child = generateNodesAndEdges(v, id, `${idx}`);
          nodes.push(...child.nodes);
          edges.push(...child.edges);
        });
      } else {
        Object.entries(value).forEach(([k, v]) => {
          const child = generateNodesAndEdges(v, id, k);
          nodes.push(...child.nodes);
          edges.push(...child.edges);
        });
      }
    } else {
      // leaf node
      const valId = `${++nodeId}`;
      nodes.push({
        id: valId,
        data: { label: String(value) },
        position: { x: 0, y: 0 },
        style: {
          background: "#FFB86C",
          borderRadius: 8,
          padding: 8,
          color: "#000",
          fontWeight: 700,
          fontSize: "16px",
        },
      });
      edges.push({
        id: `e${id}-${valId}`,
        source: id,
        target: valId,
        type: "smoothstep",
      });
    }

    return { nodes, edges };
  };

  return createNode(label, data);
};

function LayoutFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { fitView } = useReactFlow();
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleGenerate = async () => {
    setError("");

    if (!jsonInput.trim()) {
      setError("Please enter JSON data");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const { nodes: newNodes, edges: newEdges } =
        generateNodesAndEdges(parsed);

      // Apply ELK layout before rendering
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        await getLayoutedElements(newNodes, newEdges, {
          "elk.direction": "DOWN",
          ...elkOptions,
        });

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      fitView();
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
      setNodes([]);
      setEdges([]);
    }
  };
  //   const onLayout = useCallback(
  //     ({ direction }) => {
  //       const opts = { "elk.direction": direction, ...elkOptions };
  //       getLayoutedElements(nodes, edges, opts).then(
  //         ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
  //           setNodes(layoutedNodes);
  //           setEdges(layoutedEdges);
  //           fitView();
  //         }
  //       );
  //     },
  //     [nodes, edges]
  //   );

  //   useLayoutEffect(() => {
  //     onLayout({ direction: "DOWN", useInitialNodes: true });
  //   }, [onLayout]);

  const handleClear = () => {
    setJsonInput("");
    setNodes([]);
    setEdges([]);
    setError("");
  };

  const sampleJson = {
    name: "APIWIZ",
    age: 30,
    active: true,
    address: {
      street: "123 Main St",
      city: "Bengaluru",
      zipcode: "560001",
    },
  };

  const loadSample = () => {
    setJsonInput(JSON.stringify(sampleJson, null, 2));
    setError("");
  };

  return (
    <section>
      <div
        id="header"
        className="w-full border-b border-gray-200 bg-black flex items-center justify-between px-5"
      >
        <div className="flex items-center px-5 py-5">
          <h1 className="text-white text-3xl font-bold">JSON</h1>
          <RotatingText
            texts={["VIZUALIZER", "VISUALIZER"]}
            mainClassName="px-2 sm:px-2 md:px-3 text-yellow-500 text-3xl font-bold overflow-hidden justify-center"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={3000}
          />
        </div>
        <input
          type="search"
          placeholder="Search JSON"
          className="w-1/4 bg-white border border-gray-200 rounded-full py-2 px-3 relative"
        />
        <div className="absolute right-8" onClick={() => console.log("search")}>
          <Search className="hover:text-gray-800 cursor-pointer" size={26} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-5 bg-gray-50 h-screen">
        {/* Left panel */}
        <div className="w-full md:w-1/2 border-r border-gray-200 bg-white flex flex-col">
          <div className="flex-1 flex flex-col p-6 md:overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                JSON Input
              </label>
              <button
                onClick={loadSample}
                className="text-xs px-3 py-3 bg-gray-100 rounded-full hover:bg-gray-200 font-medium cursor-pointer"
              >
                Load Sample JSON
              </button>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"id": "1", "name": "APIWIZ", "values": [1,2,3]}'
              className=" p-3 border border-black rounded font-mono text-sm md:resize-none focus:outline-none h-72"
            />

            {error && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full w-full font-semibold cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={handleGenerate}
                className="w-full px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 font-semibold cursor-pointer"
              >
                Generate Tree
              </button>
            </div>
          </div>
        </div>
        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onConnect={onConnect}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <MiniMap />
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </section>
  );
}

export default LayoutFlow;
