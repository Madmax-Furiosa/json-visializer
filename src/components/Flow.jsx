/* eslint-disable react-hooks/exhaustive-deps */
import ELK from "elkjs/lib/elk.bundled.js";
import React, { useCallback, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  Background,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MiniMap,
  Controls,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import RotatingText from "./TextRotate";
import { SendHorizontal } from "lucide-react";

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

    // Detect type for coloring
    let background = "#8ED1FC";
    let border = "#3B82F6";
    let textColor = "#fff";

    if (Array.isArray(value)) {
      background = "#34D399";
      border = "#059669";
    } else if (typeof value !== "object" || value === null) {
      background = "#FDBA74";
      border = "#FB923C";
      textColor = "#000";
    } else {
      background = "#A78BFA";
      border = "#7C3AED";
    }

    nodes.push({
      id,
      data: { label: String(label) },
      position: { x: 0, y: 0 },
      style: {
        background,
        borderRadius: 8,
        padding: 10,
        color: textColor,
        border: `2px solid ${border}`,
        fontWeight: 700,
        fontSize: "16px",
        transition: "all 0.3s ease",
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
          const child = generateNodesAndEdges(v, id, `[${idx}]`);
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
      // leaf node (primitive)
      const valId = `${++nodeId}`;
      nodes.push({
        id: valId,
        data: { label: String(value) },
        position: { x: 0, y: 0 },
        style: {
          background: "#FCD34D",
          borderRadius: 8,
          padding: 8,
          color: "#000",
          border: "2px solid #F59E0B",
          fontWeight: 700,
          fontSize: "16px",
          transition: "all 0.3s ease",
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
  const { fitView, setCenter } = useReactFlow();
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const notify = () => toast("No match found");

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
      landmark: "123 Main St",
      city: "Bengaluru",
      pincode: "560001",
    },
  };

  const loadSample = () => {
    setJsonInput(JSON.stringify(sampleJson, null, 2));
    setError("");
  };

  const handleSearch = () => {
    if (!searchTerm) return;

    let foundNode = nodes.find(
      (n) =>
        n.data.label.toLowerCase() === searchTerm.split(".").pop().toLowerCase()
    );

    if (foundNode) {
      // If the matched node is a key, try to highlight its primitive value child instead
      const childEdges = edges.filter((e) => e.source === foundNode.id);
      if (childEdges.length > 0) {
        const childNodes = childEdges
          .map((e) => nodes.find((n) => n.id === e.target))
          .filter(Boolean);
        // Value node heuristic: node with no outgoing edges (leaf)
        const valueChild = childNodes.find(
          (cn) => !edges.some((e) => e.source === cn.id)
        );
        if (valueChild) {
          foundNode = valueChild;
        }
      }

      // Highlight node
      const updated = nodes.map((n) =>
        n.id === foundNode.id
          ? {
              ...n,
              style: {
                ...n.style,
                border: "3px solid #11cfe8",
                boxShadow: "0 0 10px #11cfe8",
              },
            }
          : {
              ...n,
              style: {
                ...n.style,
                boxShadow: "none",
              },
            }
      );

      setNodes(updated);
      setCenter(foundNode.position.x, foundNode.position.y, { zoom: 1.5 });
    } else {
      notify();
    }
  };

  return (
    <section>
      <div
        id="header"
        className="w-full border-b border-gray-200 bg-black flex flex-col md:flex-row items-center md:justify-between px-5"
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
        <div className="relative flex items-center gap-2 pb-5 md:pb-0">
          <input
            type="text"
            placeholder="Search JSON path (e.g., user.address)"
            value={searchTerm}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 bg-white border border-gray-200 rounded-full py-2 px-4 text-black placeholder:text-gray-400 placeholder:text-sm"
          />
          <SendHorizontal
            onClick={handleSearch}
            className="absolute right-3 text-gray-700 hover:text-black cursor-pointer"
            size={22}
          />
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
              className="p-3 border border-black rounded font-mono text-sm md:resize-none focus:outline-none h-72 md:h-96"
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
        <div className="w-full h-full min-h-0">
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
      <ToastContainer theme="light" position="top-center" autoClose={5000} />
    </section>
  );
}

export default LayoutFlow;
