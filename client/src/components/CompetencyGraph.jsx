import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CompetencyGraphNode from './CompetencyGraphNode';
import CompetencyDetailPanel from './CompetencyDetailPanel';
import api from '../services/api';
import { 
  Filter, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';

const nodeTypes = {
  competencyNode: CompetencyGraphNode,
};

// Tree layout positions for Official Statistics Taxonomy
const POSITIONS = {
  comp_official_stat: { x: 550, y: 40 },

  // Survey Methodology & Sampling Tree (Left / Center Left)
  comp_survey_meth: { x: 120, y: 180 },
  comp_sampling: { x: 80, y: 320 },
  comp_quest_des: { x: 340, y: 320 },
  comp_strat_samp: { x: -60, y: 480 },
  comp_cluster_samp: { x: 180, y: 480 },
  comp_prob_samp: { x: 80, y: 640 },
  comp_prob_fund: { x: 80, y: 800 }, // ROOT GAP

  // Data Quality Tree (Center / Center Right)
  comp_data_qual: { x: 580, y: 220 },
  comp_outlier_det: { x: 480, y: 380 },
  comp_missing_val: { x: 720, y: 380 }, // ROOT GAP
  comp_data_val: { x: 720, y: 560 },

  // Price Statistics Tree (Right)
  comp_price_stat: { x: 1050, y: 200 },
  comp_cpi: { x: 950, y: 360 },
  comp_wpi: { x: 1200, y: 360 },
  comp_index_num: { x: 1080, y: 540 },

  // National Accounts Tree (Far Right / Bottom)
  comp_nat_acc: { x: 1450, y: 200 },
  comp_sna: { x: 1450, y: 360 },
  comp_gdp: { x: 1450, y: 520 },
  comp_gva: { x: 1450, y: 680 },

  // Domain & Tech Supporting Nodes
  comp_labour_stat: { x: -160, y: 220 },
  comp_agri_stat: { x: -160, y: 360 },
  comp_sdg_ind: { x: 580, y: 50 },
  comp_stat_comp: { x: 400, y: 720 },
  comp_data_viz: { x: 400, y: 560 }
};

export default function CompetencyGraph({ userId = 'usr_ananya_sharma', onSelectCompetency }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rawNodes, setRawNodes] = useState([]);
  const [selectedCompetency, setSelectedCompetency] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Load Graph Data
  const loadGraph = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getCompetencyGraph(userId);
      setRawNodes(data.nodes || []);

      // Build React Flow Nodes
      const flowNodes = data.nodes.map(node => {
        const pos = POSITIONS[node.id] || { x: Math.random() * 800, y: Math.random() * 600 };
        return {
          id: node.id,
          type: 'competencyNode',
          position: pos,
          data: {
            ...node,
            onSelect: () => handleNodeClick(node.id)
          }
        };
      });

      // Build React Flow Edges with cascade animation and color styling
      const flowEdges = data.edges.map(edge => {
        const srcNode = data.nodes.find(n => n.id === edge.source_id);
        const tgtNode = data.nodes.find(n => n.id === edge.target_id);

        const isCascadeActive = srcNode?.isRootGap || srcNode?.isAtRisk;
        const edgeColor = srcNode?.isRootGap ? '#ef4444' : (isCascadeActive ? '#f59e0b' : '#38bdf8');

        return {
          id: edge.id,
          source: edge.source_id,
          target: edge.target_id,
          animated: isCascadeActive,
          style: {
            stroke: edgeColor,
            strokeWidth: isCascadeActive ? 2.5 : 1.8,
            strokeDasharray: isCascadeActive ? '5,5' : undefined
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
            width: 16,
            height: 16
          }
        };
      });

      setNodes(flowNodes);
      setEdges(flowEdges);

      // Default select the primary root gap
      const rootGap = data.nodes.find(n => n.isRootGap && n.id === 'comp_missing_val') || data.nodes.find(n => n.isRootGap);
      if (rootGap) {
        handleNodeClick(rootGap.id);
      }
    } catch (err) {
      console.error('Failed to load competency graph:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const handleNodeClick = async (competencyId) => {
    try {
      const detail = await api.getCompetencyDetail(competencyId, userId);
      setSelectedCompetency(detail);
      if (onSelectCompetency) onSelectCompetency(detail);
    } catch (err) {
      console.error('Failed to fetch competency detail:', err);
    }
  };

  const onNodeClickEvent = useCallback((event, node) => {
    handleNodeClick(node.id);
  }, [userId]);

  // Filter nodes by domain
  const filteredNodes = useMemo(() => {
    if (selectedDomain === 'ALL') return nodes;
    return nodes.map(n => ({
      ...n,
      hidden: n.data.domain !== selectedDomain
    }));
  }, [nodes, selectedDomain]);

  return (
    <div className="relative w-full h-[740px] bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl flex flex-col">
      
      {/* Top Controls & Legend Bar */}
      <div className="p-4 bg-slate-900/90 backdrop-blur border-b border-slate-800 z-10 flex flex-wrap items-center justify-between gap-3">
        
        {/* Domain Filter Pills */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Domains:</span>
          </div>
          {['ALL', 'STATISTICAL', 'TECHNICAL'].map(dom => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedDomain === dom
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {dom === 'ALL' ? 'Entire Graph' : dom}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Root-Cause Gap</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>At Risk (Prereq Blocked)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Mastered</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>On Track</span>
          </div>
        </div>

      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 w-full h-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Rendering Competency DAG & Prerequisite Cascade...</p>
            </div>
          </div>
        ) : null}

        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClickEvent}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#1e293b" gap={24} size={1} />
          <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-300 !text-slate-300 rounded-lg overflow-hidden shadow-xl" />
          <MiniMap
            nodeStrokeColor={(n) => (n.data?.isRootGap ? '#ef4444' : '#38bdf8')}
            nodeColor={(n) => (n.data?.isRootGap ? '#7f1d1d' : '#0f172a')}
            maskColor="rgba(15, 23, 42, 0.7)"
            className="!bg-slate-950 !border-slate-800 rounded-xl overflow-hidden"
          />
        </ReactFlow>

        {/* Floating Instruction / Alert Banner */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-300 shadow-xl flex items-center space-x-2 z-10">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Click any competency node to inspect mastery evidence, prerequisite cascade & recommended courses.</span>
        </div>
      </div>

      {/* Competency Detail Drawer */}
      {selectedCompetency && (
        <CompetencyDetailPanel
          competency={selectedCompetency}
          onClose={() => setSelectedCompetency(null)}
        />
      )}

    </div>
  );
}
