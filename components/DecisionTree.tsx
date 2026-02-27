'use client';

import { useMemo, useState } from 'react';
import { DecisionTree, DecisionNode, DecisionEdge } from '@/types/policy';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ChevronRight, GitBranch } from 'lucide-react';

interface DecisionTreeProps {
  tree: DecisionTree;
  onNodeClick?: (nodeId: string) => void;
}

export function DecisionTreeComponent({ tree, onNodeClick }: DecisionTreeProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const selectedNode = useMemo(
    () => tree.nodes.find((n) => n.id === selectedNodeId),
    [selectedNodeId, tree.nodes]
  );

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'root':
        return 'bg-primary text-primary-foreground';
      case 'decision':
        return 'bg-accent text-accent-foreground';
      case 'action':
        return 'bg-emerald-600 text-white';
      case 'outcome':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const getNodeShape = (type: string) => {
    switch (type) {
      case 'root':
        return 'rounded-full';
      case 'decision':
        return 'rounded-lg';
      case 'action':
        return 'rounded-md';
      case 'outcome':
        return 'rounded-lg';
      default:
        return 'rounded-md';
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    onNodeClick?.(nodeId);
  };

  const togglePath = (nodeId: string) => {
    const newPaths = new Set(expandedPaths);
    if (newPaths.has(nodeId)) {
      newPaths.delete(nodeId);
    } else {
      newPaths.add(nodeId);
    }
    setExpandedPaths(newPaths);
  };

  return (
    <div className="space-y-6">
      {/* Tree Visualization */}
      <Card className="p-8 bg-card border-border overflow-x-auto">
        <div className="min-h-96 flex flex-col items-center justify-start gap-8">
          {tree.nodes.map((node, idx) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center w-full"
            >
              {/* Node */}
              <motion.button
                onClick={() => handleNodeClick(node.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-4 rounded-lg font-semibold transition-all ${getNodeColor(
                  node.type
                )} ${
                  selectedNodeId === node.id
                    ? 'ring-2 ring-offset-2 ring-foreground'
                    : ''
                } max-w-xs text-center`}
              >
                <div className="flex items-center justify-center gap-2">
                  {node.type === 'decision' && (
                    <GitBranch className="w-4 h-4" />
                  )}
                  <span>{node.label}</span>
                </div>
              </motion.button>

              {/* Connecting Line */}
              {idx < tree.nodes.length - 1 && (
                <div className="w-1 h-12 bg-gradient-to-b from-primary to-transparent my-2" />
              )}

              {/* Child Nodes (if branching) */}
              {node.nextNodeIds && node.nextNodeIds.length > 1 && (
                <div className="flex gap-8 mt-6">
                  {node.nextNodeIds.map((childId) => {
                    const childNode = tree.nodes.find((n) => n.id === childId);
                    const edge = tree.edges.find(
                      (e) => e.source === node.id && e.target === childId
                    );
                    if (!childNode) return null;

                    return (
                      <motion.div
                        key={childId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-center"
                      >
                        {/* Branch Line */}
                        <div className="w-1 h-8 bg-border" />

                        {/* Child Node */}
                        <motion.button
                          onClick={() => handleNodeClick(childId)}
                          whileHover={{ scale: 1.05 }}
                          className={`px-4 py-3 rounded-lg font-medium transition-all ${getNodeColor(
                            childNode.type
                          )} ${
                            selectedNodeId === childId
                              ? 'ring-2 ring-offset-2 ring-foreground'
                              : ''
                          } max-w-xs text-center text-sm`}
                        >
                          {childNode.label}
                        </motion.button>

                        {/* Edge Label */}
                        {edge && (
                          <div className="mt-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {edge.label}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Node Details Panel */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-card border-border">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="bg-muted text-foreground"
                >
                  {selectedNode.type.toUpperCase()}
                </Badge>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedNode.label}
                </h3>
              </div>

              {selectedNode.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedNode.description}
                </p>
              )}

              {/* Outgoing Edges */}
              {selectedNode.nextNodeIds && selectedNode.nextNodeIds.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-foreground">
                    Next Steps:
                  </h4>
                  <div className="space-y-2">
                    {selectedNode.nextNodeIds.map((nextId) => {
                      const nextNode = tree.nodes.find((n) => n.id === nextId);
                      const edge = tree.edges.find(
                        (e) => e.source === selectedNode.id && e.target === nextId
                      );
                      if (!nextNode) return null;

                      return (
                        <motion.button
                          key={nextId}
                          onClick={() => handleNodeClick(nextId)}
                          whileHover={{ x: 4 }}
                          className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left group"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {nextNode.label}
                              </p>
                              {edge?.condition && (
                                <p className="text-xs text-muted-foreground">
                                  {edge.condition}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {edge?.label}
                          </Badge>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
