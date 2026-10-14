export type NodeStatus = 'healthy' | 'warning' | 'error';
export type NodeType = 'gateway' | 'service' | 'database' | 'cache';

export interface TopologyNode {
  id: string;
  label: string;
  type: NodeType;
  status: NodeStatus;
  x: number;
  y: number;
  metadata?: Record<string, unknown>;
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  latency: number;
}
