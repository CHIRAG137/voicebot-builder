import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  NodeTypes,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, MessageSquare, HelpCircle, GitBranch, CheckCircle, Link2 } from 'lucide-react';

// Node type definitions
interface NodeData extends Record<string, unknown> {
  label: string;
  type: 'message' | 'question' | 'confirmation' | 'branch' | 'redirect';
  message?: string;
  variable?: string;
  options?: string[];
  redirectUrl?: string;
}

// Custom Node Components
const MessageNode = ({ data }: { data: NodeData }) => (
  <div className="bg-card border-2 border-primary/20 rounded-lg p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-2">
      <MessageSquare className="w-4 h-4 text-primary" />
      <span className="font-semibold text-sm">Message</span>
    </div>
    <p className="text-xs text-muted-foreground">{data.message || 'No message set'}</p>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const QuestionNode = ({ data }: { data: NodeData }) => (
  <div className="bg-card border-2 border-blue-500/20 rounded-lg p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-2">
      <HelpCircle className="w-4 h-4 text-blue-500" />
      <span className="font-semibold text-sm">Question</span>
    </div>
    <p className="text-xs text-muted-foreground">{data.message || 'No question set'}</p>
    {data.variable && (
      <p className="text-xs text-blue-500 mt-1">→ {data.variable}</p>
    )}
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const ConfirmationNode = ({ data }: { data: NodeData }) => (
  <div className="bg-card border-2 border-green-500/20 rounded-lg p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-2">
      <CheckCircle className="w-4 h-4 text-green-500" />
      <span className="font-semibold text-sm">Confirmation</span>
    </div>
    <p className="text-xs text-muted-foreground">{data.message || 'Confirm previous input?'}</p>
    <div className="flex gap-4 mt-2">
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="yes" 
        className="w-3 h-3 !left-[30%]" 
        style={{ background: 'green' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="no" 
        className="w-3 h-3 !left-[70%]" 
        style={{ background: 'red' }}
      />
    </div>
    <div className="flex justify-between text-xs mt-1">
      <span className="text-green-500">Yes</span>
      <span className="text-red-500">No</span>
    </div>
  </div>
);

const BranchNode = ({ data }: { data: NodeData }) => (
  <div className="bg-card border-2 border-purple-500/20 rounded-lg p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-2">
      <GitBranch className="w-4 h-4 text-purple-500" />
      <span className="font-semibold text-sm">Branch</span>
    </div>
    <p className="text-xs text-muted-foreground">{data.message || 'Conditional branch'}</p>
    {data.options && data.options.length > 0 && (
      <div className="mt-2">
        {data.options.map((option, index) => (
          <Handle
            key={index}
            type="source"
            position={Position.Bottom}
            id={`option-${index}`}
            className="w-3 h-3"
            style={{ left: `${(index + 1) * (100 / (data.options!.length + 1))}%` }}
          />
        ))}
        <div className="flex justify-around text-xs mt-1">
          {data.options.map((option, index) => (
            <span key={index} className="text-purple-500">{option}</span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const RedirectNode = ({ data }: { data: NodeData }) => (
  <div className="bg-card border-2 border-orange-500/20 rounded-lg p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-2">
      <Link2 className="w-4 h-4 text-orange-500" />
      <span className="font-semibold text-sm">Redirect</span>
    </div>
    <p className="text-xs text-muted-foreground">{data.redirectUrl || 'No URL set'}</p>
  </div>
);

const nodeTypes: NodeTypes = {
  message: MessageNode,
  question: QuestionNode,
  confirmation: ConfirmationNode,
  branch: BranchNode,
  redirect: RedirectNode,
};

interface FlowBuilderProps {
  botId?: string;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onFlowChange?: (nodes: Node[], edges: Edge[]) => void; // New prop for real-time updates
}

export function FlowBuilder({ botId, onSave, onFlowChange }: FlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([
    {
      id: '1',
      type: 'message',
      position: { x: 250, y: 50 },
      data: { 
        label: 'Welcome Message',
        type: 'message',
        message: 'Hello! I\'m here to help you. Let\'s start by getting some information.'
      },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);

  // Auto-save flow changes to parent component
  useEffect(() => {
    if (onFlowChange) {
      onFlowChange(nodes, edges);
    }
  }, [nodes, edges, onFlowChange]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<NodeData>);
    setShowNodeEditor(true);
  }, []);

  const addNode = (type: NodeData['type']) => {
    const newNode: Node<NodeData> = {
      id: `${nodes.length + 1}`,
      type,
      position: { x: 250, y: nodes.length * 150 + 100 },
      data: {
        label: `${type} Node`,
        type,
        message: '',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateNode = (nodeId: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } as NodeData }
          : node
      )
    );
    // Update selected node to reflect changes
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...data } as NodeData } : null);
    }
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setShowNodeEditor(false);
    setSelectedNode(null);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
  };

  return (
    <div className="h-[600px] relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addNode('message')}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Message
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addNode('question')}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Question
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addNode('confirmation')}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirmation
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addNode('branch')}
        >
          <GitBranch className="w-4 h-4 mr-2" />
          Branch
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addNode('redirect')}
        >
          <Link2 className="w-4 h-4 mr-2" />
          Redirect
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Button type="button" onClick={handleSave}>
          Save Flow
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>

      {/* Node Editor Panel */}
      {showNodeEditor && selectedNode && (
        <Card className="absolute top-20 right-4 z-50 w-80 p-4 shadow-lg bg-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Edit Node</h3>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowNodeEditor(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {(selectedNode.data.type === 'message' || 
              selectedNode.data.type === 'question' || 
              selectedNode.data.type === 'confirmation') && (
              <div>
                <Label htmlFor="node-message">Message</Label>
                <Textarea
                  id="node-message"
                  value={selectedNode.data.message || ''}
                  onChange={(e) => updateNode(selectedNode.id, { message: e.target.value })}
                  placeholder="Enter your message..."
                  className="mt-1 nodrag"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {selectedNode.data.type === 'question' && (
              <div>
                <Label htmlFor="node-variable">Variable Name</Label>
                <Input
                  id="node-variable"
                  type="text"
                  value={selectedNode.data.variable || ''}
                  onChange={(e) => updateNode(selectedNode.id, { variable: e.target.value })}
                  placeholder="e.g., userName, userEmail"
                  className="mt-1 nodrag"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {selectedNode.data.type === 'branch' && (
              <div>
                <Label htmlFor="node-options">Options (comma separated)</Label>
                <Input
                  id="node-options"
                  type="text"
                  value={selectedNode.data.options?.join(', ') || ''}
                  onChange={(e) => updateNode(selectedNode.id, { 
                    options: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  placeholder="Option 1, Option 2, Option 3"
                  className="mt-1 nodrag"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {selectedNode.data.type === 'redirect' && (
              <div>
                <Label htmlFor="node-redirect">Redirect URL</Label>
                <Input
                  id="node-redirect"
                  type="text"
                  value={selectedNode.data.redirectUrl || ''}
                  onChange={(e) => updateNode(selectedNode.id, { redirectUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="mt-1 nodrag"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteNode(selectedNode.id)}
              className="w-full"
            >
              Delete Node
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}