/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";

function LayoutFlow() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const handleClear = () => {
    setJsonInput("");
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
    hobbies: ["reading", "gaming", "hiking"],
    metadata: null,
  };

  const loadSample = () => {
    setJsonInput(JSON.stringify(sampleJson, null, 2));
    setError("");
  };

  return (
    <div className="flex gap-5 bg-gray-50 h-screen">
      {/* Left panel */}
      <div className="w-full border-r border-gray-200 bg-white flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            JSON Tree Visualizer
          </h1>
          <p className="text-sm text-gray-500">Paste JSON and generate flow</p>
        </div>

        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              JSON Input
            </label>
            <button
              onClick={loadSample}
              className="text-xs px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Load Sample
            </button>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"name": "example", "values": [1,2,3]}'
            className="flex-1 p-3 border-2 border-gray-300 rounded font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
          />

          {error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                console.log(jsonInput);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate Tree
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LayoutFlow;
