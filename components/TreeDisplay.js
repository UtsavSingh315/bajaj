"use client";

import "./TreeDisplay.css";

export default function TreeDisplay({ hierarchies }) {
  const renderTree = (tree) => {
    if (!tree || Object.keys(tree).length === 0) {
      return <span className="tree-empty">{"{ }"}</span>;
    }

    const renderNode = (key, value, depth = 0) => {
      const isLeaf = !value || Object.keys(value).length === 0;

      return (
        <div key={key} className="tree-node" style={{ marginLeft: `${depth * 20}px` }}>
          <span className="node-label">{key}</span>
          {!isLeaf && (
            <div className="node-children">
              {Object.entries(value).map(([childKey, childValue]) =>
                renderNode(childKey, childValue, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="tree-container">
        {Object.entries(tree).map(([key, value]) =>
          renderNode(key, value, 0)
        )}
      </div>
    );
  };

  return (
    <div className="hierarchies-section">
      <h3>🏗️ Hierarchies</h3>
      <div className="hierarchies-grid">
        {hierarchies.map((hierarchy, idx) => (
          <div
            key={idx}
            className={`hierarchy-card ${hierarchy.has_cycle ? "cycle" : ""}`}
          >
            <div className="hierarchy-header">
              <span className="root-label">Root: {hierarchy.root}</span>
              {hierarchy.has_cycle && (
                <span className="cycle-badge">🔄 Cycle</span>
              )}
              {!hierarchy.has_cycle && (
                <span className="depth-badge">📏 Depth: {hierarchy.depth}</span>
              )}
            </div>
            <div className="hierarchy-tree">
              {renderTree(hierarchy.tree)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
