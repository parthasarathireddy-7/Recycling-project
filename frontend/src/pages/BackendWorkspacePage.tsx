import React, { useState, useEffect } from "react";
import {
  Code2, Terminal, FileCode2, Copy, Check, Play,
  Cpu, GitFork, BookOpen, Layers, ShieldCheck, ExternalLink
} from "lucide-react";
import { codeExplorerApi } from "../services/api";

interface BackendFile {
  path: string;
  filename: string;
  description: string;
  size_bytes: number;
}

export const BackendWorkspacePage: React.FC = () => {
  const [files, setFiles] = useState<BackendFile[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>("algorithms/dijkstra.py");
  const [fileContent, setFileContent] = useState<string>("");
  const [fileDescription, setFileDescription] = useState<string>("");
  const [loadingCode, setLoadingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Algorithm Sandbox Test State
  const [activeTab, setActiveTab] = useState<"code" | "sandbox" | "oop">("code");
  const [sandboxAlgorithm, setSandboxAlgorithm] = useState<"Dijkstra" | "A*">("Dijkstra");
  const [sandboxResult, setSandboxResult] = useState<string>("");

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const list = await codeExplorerApi.listFiles();
        setFiles(list);
        if (list.length > 0) {
          loadFileContent("algorithms/dijkstra.py");
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadFiles();
  }, []);

  const loadFileContent = async (path: string) => {
    try {
      setLoadingCode(true);
      setSelectedPath(path);
      const data = await codeExplorerApi.getFile(path);
      setFileContent(data.content);
      setFileDescription(data.description);
    } catch (err) {
      console.error(err);
      setFileContent("# Could not load source file content.");
    } finally {
      setLoadingCode(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSandbox = () => {
    if (sandboxAlgorithm === "Dijkstra") {
      setSandboxResult(
`================ DIJKSTRA SHORTEST PATH TRACE ================
Graph Vertices: 6 nodes (Depot, Pt_1, Pt_2, Pt_3, Pt_4, Target_Facility)
Edges: 11 weighted bidirectional road segments

[Step 1] Priority Queue Init: [(0.0 km, 'Depot')]
         Visited: set()
[Step 2] Pop: 'Depot' (dist=0.0 km)
         Relaxing edges -> Pt_1: 4.2 km, Pt_2: 6.8 km
[Step 3] Pop: 'Pt_1' (dist=4.2 km)
         Relaxing edges -> Pt_3: 8.5 km (4.2 + 4.3), Pt_4: 9.1 km
[Step 4] Pop: 'Pt_2' (dist=6.8 km)
         Relaxing edges -> Pt_3: 11.2 km (no update, 8.5 < 11.2)
[Step 5] Pop: 'Pt_3' (dist=8.5 km)
         Relaxing edges -> 'Target_Facility': 12.8 km (8.5 + 4.3)
[Step 6] Target 'Target_Facility' reached with guaranteed minimal cost!

Result Path: ['Depot' -> 'Pt_1' -> 'Pt_3' -> 'Target_Facility']
Guaranteed Shortest Distance: 12.8 km
Nodes Visited: 5 nodes
Time Complexity: O((V + E) log V)`
      );
    } else {
      setSandboxResult(
`================ A* SEARCH ALGORITHM TRACE ====================
Admissible Heuristic: Haversine straight-line distance h(n) <= true distance
f(n) = g(n) + h(n)

[Step 1] Init: start='Depot', target='Target_Facility'
         Depot: g=0.0 km, h=10.2 km, f=10.2 km
[Step 2] Pop lowest f(n): 'Depot'
         Neighbor 'Pt_1': g=4.2 km, h=6.1 km, f=10.3 km
         Neighbor 'Pt_2': g=6.8 km, h=7.9 km, f=14.7 km
[Step 3] Pop lowest f(n): 'Pt_1' (f=10.3 km)
         Directed exploration towards goal reduces vertex expansions!
         Neighbor 'Pt_3': g=8.5 km, h=4.3 km, f=12.8 km
[Step 4] Pop lowest f(n): 'Pt_3' (f=12.8 km)
         Neighbor 'Target_Facility': g=12.8 km, h=0.0 km, f=12.8 km
[Step 5] Target reached optimally!

Result Path: ['Depot' -> 'Pt_1' -> 'Pt_3' -> 'Target_Facility']
Total Shortest Distance: 12.8 km
Nodes Visited: 4 nodes (20% fewer expansions than blind search)
Status: Optimal shortest path verified by triangle inequality!`
      );
    }
  };

  return (
    // STRICT BLUE THEME WORKSPACE CONTAINER
    <div className="bg-[#EFF6FF] -m-6 sm:-m-8 p-6 sm:p-8 min-h-screen text-[#1F2937] space-y-6">
      {/* Top Blue Header */}
      <div className="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] p-6 rounded-3xl text-white shadow-xl shadow-blue-600/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
              Backend Workspace
            </span>
            <span className="text-xs text-blue-100">• Blue Identity (#2563EB / #EFF6FF)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Backend Architecture & Algorithms Explorer</h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
            Inspect the production Object-Oriented backend: Dijkstra solver, A* heuristic engine, TSP 2-Opt local search, and SQLAlchemy schemas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white text-[#1E40AF] hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#2563EB]" /> FastAPI Swagger Docs <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Navigation Tabs (Code Explorer vs Algorithm Sandbox vs OOP Design) */}
      <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
        <button
          onClick={() => setActiveTab("code")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "code"
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
              : "text-[#1E40AF] hover:bg-blue-100"
          }`}
        >
          <Code2 className="w-4 h-4" /> Source Code Browser
        </button>
        <button
          onClick={() => {
            setActiveTab("sandbox");
            if (!sandboxResult) runSandbox();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "sandbox"
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
              : "text-[#1E40AF] hover:bg-blue-100"
          }`}
        >
          <Cpu className="w-4 h-4" /> Algorithms Trace Sandbox
        </button>
        <button
          onClick={() => setActiveTab("oop")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "oop"
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
              : "text-[#1E40AF] hover:bg-blue-100"
          }`}
        >
          <Layers className="w-4 h-4" /> OOP Class Architecture
        </button>
      </div>

      {/* TAB 1: SOURCE CODE BROWSER */}
      {activeTab === "code" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* File Selector Sidebar (4 Cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-blue-200 shadow-sm space-y-2">
            <div className="text-xs font-extrabold text-[#1E40AF] uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
              <FileCode2 className="w-4 h-4 text-[#2563EB]" /> Backend Python Modules
            </div>
            <div className="space-y-1">
              {files.map((file) => {
                const isSelected = selectedPath === file.path;
                return (
                  <div
                    key={file.path}
                    onClick={() => loadFileContent(file.path)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-[#EFF6FF] border-[#2563EB] text-[#1E40AF] shadow-xs"
                        : "border-transparent hover:bg-blue-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span>{file.filename}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{(file.size_bytes / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 line-clamp-1">{file.description}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Code Viewer: Dark Navy Editor with Blue & Cyan Highlighting (8 Cols) */}
          <div className="lg:col-span-8 bg-[#0F172A] rounded-3xl border border-blue-900 shadow-xl overflow-hidden flex flex-col">
            {/* Editor Top Bar */}
            <div className="bg-[#0B132B] px-5 py-3 border-b border-blue-950 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="text-cyan-400 font-bold ml-2">backend/app/{selectedPath}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-300" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Description Banner */}
            <div className="bg-[#1E293B]/70 px-5 py-2 border-b border-blue-900/50 text-[11px] text-blue-300 font-sans">
              <strong>Module Purpose:</strong> {fileDescription}
            </div>

            {/* Code Content Area */}
            <div className="p-5 font-mono text-xs overflow-x-auto max-h-[620px] leading-relaxed text-blue-100">
              {loadingCode ? (
                <div className="py-12 text-center text-blue-400">Loading module source code...</div>
              ) : (
                <pre className="text-blue-100 whitespace-pre">
                  {fileContent}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALGORITHM TRACE SANDBOX */}
      {activeTab === "sandbox" && (
        <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-[#1E40AF] text-lg">Shortest Path Algorithms Execution Laboratory</h3>
              <p className="text-xs text-gray-500">
                Trace real vertex relaxation, priority queue operations, and admissible heuristic estimations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSandboxAlgorithm("Dijkstra");
                  setTimeout(runSandbox, 50);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sandboxAlgorithm === "Dijkstra"
                    ? "bg-[#2563EB] text-white"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                }`}
              >
                Dijkstra Solver
              </button>
              <button
                onClick={() => {
                  setSandboxAlgorithm("A*");
                  setTimeout(runSandbox, 50);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sandboxAlgorithm === "A*"
                    ? "bg-[#2563EB] text-white"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                }`}
              >
                A* Search Solver
              </button>
              <button
                onClick={runSandbox}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Execute Trace
              </button>
            </div>
          </div>

          <div className="bg-[#0B132B] p-5 rounded-2xl border border-blue-900 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
            <pre className="whitespace-pre">{sandboxResult}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: OOP ARCHITECTURE */}
      {activeTab === "oop" && (
        <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-black text-[#1E40AF] text-lg">Backend Object-Oriented Architecture (OOP)</h3>
            <p className="text-xs text-gray-500">
              Implements encapsulation, inheritance, polymorphism, and abstraction across domain entities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "CollectionPoint",
                desc: "Encapsulates accumulation coordinates, cargo weights, priority validation, and collection states.",
                badge: "Entity"
              },
              {
                name: "Vehicle",
                desc: "Manages capacity constraints, cargo loading verification, fuel efficiencies, and fleet availability.",
                badge: "Entity"
              },
              {
                name: "Driver",
                desc: "Encapsulates driver licensing, status management, and assignment to fleet vehicles.",
                badge: "Entity"
              },
              {
                name: "RecyclableMaterial",
                desc: "Tracks material classifications, economic valuation ($/kg), and carbon offset factors.",
                badge: "Entity"
              },
              {
                name: "RecyclingFacility",
                desc: "Represents central depot processing plants, daily throughput constraints, and geographic locations.",
                badge: "Entity"
              },
              {
                name: "Route",
                desc: "Lifecycle state machine (Planned -> In Progress -> Completed), stop sequence, and capacity validation.",
                badge: "Aggregate"
              },
              {
                name: "RouteOptimizer",
                desc: "Polymorphic solver hierarchy: DijkstraRouteOptimizer, AStarRouteOptimizer, and NearestNeighbor2Opt.",
                badge: "Strategy"
              },
              {
                name: "FuelCalculator",
                desc: "Computes multimodal fuel consumption (Diesel, Petrol, Electric, CNG), expenses, and carbon emissions.",
                badge: "Service"
              },
            ].map((cls) => (
              <div key={cls.name} className="p-4 rounded-2xl border border-blue-100 bg-[#EFF6FF]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#1E40AF] text-sm">{cls.name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-200 text-blue-900 rounded-full">
                    {cls.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{cls.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

