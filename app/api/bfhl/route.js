/**
 * Validates if a string is a valid node edge format (X->Y where X,Y are uppercase letters)
 */
function isValidEdge(entry) {
  if (typeof entry !== "string") return false;
  const trimmed = entry.trim();
  if (trimmed === "") return false;
  const regex = /^[A-Z]->[A-Z]$/;
  return regex.test(trimmed);
}

function findConnectedComponents(edges) {
  if (edges.length === 0) return [];

  const graph = new Map();
  const nodeComponentMap = new Map();
  let componentCount = 0;

  for (const edge of edges) {
    const [a, b] = edge.split("->");

    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);

    graph.get(a).push(b);
    graph.get(b).push(a);
  }

  const visited = new Set();

  function dfs(node, compId) {
    visited.add(node);
    nodeComponentMap.set(node, compId);

    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, compId);
      }
    }
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node, componentCount++);
    }
  }

  const componentEdges = new Map();
  for (let i = 0; i < componentCount; i++) {
    componentEdges.set(i, []);
  }

  for (const edge of edges) {
    const [a] = edge.split("->");
    const compId = nodeComponentMap.get(a);
    componentEdges.get(compId).push(edge);
  }

  return Array.from(componentEdges.values());
}

/**
 * Detect if there's a cycle in the component
 */
function detectCycle(start, graph, nodes) {
  const visited = new Set();
  const recursionStack = new Set();

  function hasCycleDFS(node) {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || [];
    for (const child of neighbors) {
      if (!visited.has(child)) {
        if (hasCycleDFS(child)) {
          return true;
        }
      } else if (recursionStack.has(child)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node)) {
      if (hasCycleDFS(node)) {
        return true;
      }
    }
  }

  return false;
}

function buildTree(root, graph) {
  const tree = {};
  const visited = new Set();

  function buildSubtree(node) {
    if (visited.has(node)) {
      return {};
    }

    visited.add(node);
    const subtree = {};

    const children = graph.get(node) || [];
    for (const child of children) {
      subtree[child] = buildSubtree(child);
    }

    return subtree;
  }

  tree[root] = buildSubtree(root);
  return tree;
}

function calculateDepth(tree) {
  function getMaxDepth(node, depth = 1) {
    if (!node || Object.keys(node).length === 0) {
      return depth;
    }

    let maxChildDepth = depth;
    for (const child of Object.values(node)) {
      maxChildDepth = Math.max(maxChildDepth, getMaxDepth(child, depth + 1));
    }

    return maxChildDepth;
  }

  for (const root in tree) {
    return getMaxDepth(tree[root]);
  }

  return 0;
}

function processBFHL(data) {
  const invalidEntries = [];
  const seenEdges = new Set();
  const duplicateEdges = [];
  const validEdges = [];

  // Validate and filter edges
  for (const entry of data) {
    const trimmed = String(entry).trim();

    if (!isValidEdge(trimmed)) {
      invalidEntries.push(trimmed);
      continue;
    }

    if (seenEdges.has(trimmed)) {
      duplicateEdges.push(trimmed);
    } else {
      seenEdges.add(trimmed);
      validEdges.push(trimmed);
    }
  }

  // Build graph structure and identify connected components
  const graph = new Map(); // parent -> [children]
  const children = new Set(); // all nodes that appear as children
  const allNodes = new Set();

  for (const edge of validEdges) {
    const [parent, child] = edge.split("->");
    allNodes.add(parent);
    allNodes.add(child);
    children.add(child);

    if (!graph.has(parent)) {
      graph.set(parent, []);
    }

    if (!graph.get(parent).includes(child)) {
      graph.get(parent).push(child);
    }
  }
  const components = findConnectedComponents(validEdges);

  // Process each component
  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = null;
  let largestTreeDepth = 0;

  for (const component of components) {
    const componentChildren = new Set();
    const componentNodes = new Set();
    const componentGraph = new Map();

    // Build component graph
    for (const edge of component) {
      const [parent, child] = edge.split("->");
      componentNodes.add(parent);
      componentNodes.add(child);
      componentChildren.add(child);

      if (!componentGraph.has(parent)) {
        componentGraph.set(parent, []);
      }
      if (!componentGraph.get(parent).includes(child)) {
        componentGraph.get(parent).push(child);
      }
    }

    let roots = Array.from(componentNodes).filter(
      (node) => !componentChildren.has(node)
    );

    if (roots.length === 0) {
      roots = [Array.from(componentNodes).sort()[0]];
    }

    for (const root of roots) {
      const hasCycle = detectCycle(root, componentGraph, componentNodes);

      if (hasCycle) {
        hierarchies.push({
          root,
          tree: {},
          has_cycle: true,
        });
        totalCycles++;
      } else {
        const tree = buildTree(root, componentGraph);
        const depth = calculateDepth(tree);

        hierarchies.push({
          root,
          tree,
          depth,
        });
        totalTrees++;

        if (
          depth > largestTreeDepth ||
          (depth === largestTreeDepth &&
            (largestTreeRoot === null || root < largestTreeRoot))
        ) {
          largestTreeDepth = depth;
          largestTreeRoot = root;
        }
      }
    }
  }

  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  const uniqueDuplicates = Array.from(new Set(duplicateEdges)).sort();

  return {
    user_id: "utsavsingh_15032005",
    email_id: "us9191@srmist.edu.in",
    college_roll_number: "RA2311028030024",
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: uniqueDuplicates,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot,
    },
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!Array.isArray(data)) {
      return new Response(
        JSON.stringify({ error: "data must be an array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = processBFHL(data);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
