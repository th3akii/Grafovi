function downloadFile(filename, content) {
    console.log("downloadFile pozvan sa:", filename, content);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

var networkInstances = {};

function renderGraph(containerId, nodesData, edgesData, isDirected, isWeighted, settings) {
    console.log("renderGraph called", { containerId, nodesData, edgesData, isDirected, isWeighted, settings });

    if (typeof vis === 'undefined') {
        console.error("vis.js library is not loaded.");
        alert("Biblioteka za vizualizaciju nije učitana. Proverite internet konekciju.");
        return;
    }

    var container = document.getElementById(containerId);
    if (!container) {
        console.error("Container element not found:", containerId);
        return;
    }
    
    try {
        // Normalize settings regardless of property naming
        settings = settings || {};
        var nodeColor = settings.bojaCvora ?? settings.nodeColor ?? '#97C2FC';
        var edgeColor = settings.bojaGrane ?? settings.edgeColor ?? '#2B7CE9';
        var nodeSize = settings.velicinaCvora ?? settings.nodeSize ?? 16;
        var lockMovement = settings.zakljucanoPomeranje ?? settings.lockMovement ?? false;
        var preservePositions = settings.cuvajPoziciju ?? settings.preservePositions ?? false;

        // Prepare data arrays
        var nodesArray = nodesData.map((n, index) => {
            var rawLabel = n.naziv ?? n.label ?? n.name ?? '';
            var nodeLabel = rawLabel ? rawLabel.toString() : '';
            var originalId = n.id ?? n.ID ?? nodeLabel;
            var nodeId = (nodeLabel && nodeLabel.length > 0)
                ? nodeLabel
                : (originalId != null ? originalId.toString() : `node_${index}`);

            return {
                id: nodeId,
                label: nodeLabel || nodeId,
                color: nodeColor,
                size: nodeSize
            };
        });

        var edgesArray = edgesData.map(e => {
            var edgeId = (e.id || e.ID || '').toString();
            var fromIdSource = e.pocetniCvor?.naziv ?? e.pocetniCvor?.label ?? e.pocetniCvor?.id ?? e.pocetniCvor?.ID;
            var toIdSource = e.krajnjiCvor?.naziv ?? e.krajnjiCvor?.label ?? e.krajnjiCvor?.id ?? e.krajnjiCvor?.ID;

            return {
                id: edgeId !== '' ? edgeId : `${fromIdSource}_${toIdSource}`,
                from: fromIdSource?.toString(),
                to: toIdSource?.toString(),
                label: isWeighted && e.tezina != null ? e.tezina.toString() : undefined,
                arrows: isDirected ? 'to' : undefined,
                width: 2,
                color: { color: edgeColor }
            };
        });

        // Check if we should update existing network
        if (networkInstances[containerId] && preservePositions) {
            var instance = networkInstances[containerId];
            
            // Preserve current positions
            var positions = instance.network.getPositions();
            var boundingBoxes = buildNodeBoundingBoxes(instance);
            
            // Prepare nodes with preserved positions
            var nodesWithPositions = nodesArray.map(n => {
                var node = { ...n };
                if (positions[n.id]) {
                    node.x = positions[n.id].x;
                    node.y = positions[n.id].y;
                }
                return node;
            });

            // Assign new positions for nodes that don't have stored coordinates
            var nodesWithoutPosition = nodesWithPositions.filter(n => typeof n.x === 'undefined');
            if (nodesWithoutPosition.length > 0) {
                var existingPositions = nodesWithPositions
                    .filter(n => typeof n.x !== 'undefined' && typeof n.y !== 'undefined')
                    .map(n => ({
                        id: n.id,
                        x: n.x,
                        y: n.y,
                        size: n.size || nodeSize,
                        boundingBox: boundingBoxes[n.id]
                    }));

                var center = calculateGraphCenter(existingPositions, container);

                nodesWithoutPosition.forEach((node, index) => {
                    var position = findFreePosition(existingPositions, center, index, nodeSize);
                    node.x = position.x;
                    node.y = position.y;
                    existingPositions.push(position);
                });
            }

            nodesWithPositions.forEach(node => {
                node.fixed = { x: false, y: false };
            });
            
            // Update Nodes
            var currentNodes = instance.nodes.getIds();
            var newNodesIds = nodesWithPositions.map(n => n.id);
            var nodesToRemove = currentNodes.filter(id => !newNodesIds.includes(id));
            
            instance.nodes.remove(nodesToRemove);
            instance.nodes.update(nodesWithPositions);

            // Update Edges
            var currentEdges = instance.edges.getIds();
            var newEdgesIds = edgesArray.map(e => e.id);
            var edgesToRemove = currentEdges.filter(id => !newEdgesIds.includes(id));
            
            instance.edges.remove(edgesToRemove);
            instance.edges.update(edgesArray);

            // Update Options - disable physics to prevent rearrangement
            instance.network.setOptions({
                interaction: {
                    dragNodes: !lockMovement,
                    dragView: true,
                    zoomView: true
                },
                nodes: {
                    font: { size: nodeSize }
                },
                physics: {
                    enabled: false // Disable physics when preserving positions
                }
            });

        } else {
            // Create New Network
            var nodes = new vis.DataSet(nodesArray);
            var edges = new vis.DataSet(edgesArray);

            var data = {
                nodes: nodes,
                edges: edges
            };

            var options = {
                nodes: {
                    shape: 'ellipse',
                    font: {
                        size: nodeSize
                    },
                    borderWidth: 2,
                    shadow: true,
                    color: nodeColor
                },
                edges: {
                    width: 2,
                    shadow: true,
                    smooth: {
                        type: 'continuous'
                    },
                    font: {
                        align: 'top'
                    },
                    color: { color: edgeColor }
                },
                physics: {
                    enabled: true,
                    stabilization: false,
                    barnesHut: {
                        gravitationalConstant: -2000,
                        springConstant: 0.04,
                        springLength: 95
                    }
                },
                interaction: {
                    dragNodes: !lockMovement,
                    dragView: true,
                    zoomView: true
                }
            };

            // Destroy old if exists but we are not preserving
            if (networkInstances[containerId]) {
                networkInstances[containerId].network.destroy();
            }

            var network = new vis.Network(container, data, options);
            networkInstances[containerId] = { network: network, nodes: nodes, edges: edges };
        }

    } catch (error) {
        console.error("Error in renderGraph:", error);
        alert("Došlo je do greške prilikom iscrtavanja grafa: " + error.message);
    }
}

function clearGraph(containerId) {
    if (networkInstances[containerId]) {
        networkInstances[containerId].network.destroy();
        delete networkInstances[containerId];
        console.log("Graph cleared for container:", containerId);
    }
}

function updateEdgeLabels(containerId, edgesData, isWeighted) {
    console.log("updateEdgeLabels called", { containerId, edgesCount: edgesData ? edgesData.length : 0, isWeighted });
    try {
        var instance = networkInstances[containerId];
        if (!instance || !Array.isArray(edgesData)) {
            console.warn("Instance not found or edgesData is not array");
            return;
        }

        var updates = edgesData.map(function (edge) {
            var id = (edge.id || edge.ID).toString();
            var weight = edge.tezina ?? edge.Tezina;
            
            // Use space " " to clear label if null doesn't work as expected
            var labelContent = (isWeighted && weight != null) ? weight.toString() : " ";

            return {
                id: id,
                label: labelContent
            };
        });

        console.log("Updating edges with:", updates);
        instance.edges.update(updates);
        instance.network.redraw();
    } catch (error) {
        console.error("Error updating edge labels:", error);
    }
}

function calculateGraphCenter(existingPositions, container) {
    if (existingPositions.length > 0) {
        var sum = existingPositions.reduce((acc, pos) => {
            acc.x += pos.x;
            acc.y += pos.y;
            return acc;
        }, { x: 0, y: 0 });
        return {
            x: sum.x / existingPositions.length,
            y: sum.y / existingPositions.length
        };
    }

    var rect = container.getBoundingClientRect();
    return {
        x: rect.width / 2,
        y: rect.height / 2
    };
}

function findFreePosition(existingPositions, center, index, nodeSize) {
    var minDistance = Math.max(nodeSize * 4, 100);
    var padding = nodeSize * 1.5;
    var angle = (2 * Math.PI * index) / Math.max(existingPositions.length || 1, 1);
    var radius = 120 + (index * 40);
    var attempts = 0;

    while (attempts < 80) {
        var x = center.x + Math.cos(angle) * radius;
        var y = center.y + Math.sin(angle) * radius;

        var overlapping = existingPositions.some(pos =>
            boxesOverlap(pos.boundingBox, createBoundingBox(x, y, nodeSize, padding)) ||
            distanceBetween(pos, { x, y }) < minDistance
        );

        if (!overlapping) {
            return {
                x: x,
                y: y,
                boundingBox: createBoundingBox(x, y, nodeSize, padding)
            };
        }

        angle += Math.PI / 8;
        radius += nodeSize * 2;
        attempts++;
    }

    return {
        x: center.x + (Math.random() * 250 - 125),
        y: center.y + (Math.random() * 250 - 125),
        boundingBox: createBoundingBox(center.x, center.y, nodeSize, padding)
    };
}

function distanceBetween(a, b) {
    var dx = (a.x || 0) - (b.x || 0);
    var dy = (a.y || 0) - (b.y || 0);
    return Math.sqrt(dx * dx + dy * dy);
}

function boxesOverlap(a, b) {
    if (!a || !b) {
        return false;
    }
    return !(a.right < b.left ||
             a.left > b.right ||
             a.bottom < b.top ||
             a.top > b.bottom);
}

function createBoundingBox(x, y, size, padding) {
    var half = (size + padding) / 2;
    return {
        left: x - half,
        right: x + half,
        top: y - half,
        bottom: y + half
    };
}

function buildNodeBoundingBoxes(instance) {
    var boundingBoxes = {};
    try {
        instance.network.storePositions();
        var domPositions = instance.network.getPositions();
        Object.keys(domPositions).forEach(function (nodeId) {
            var position = instance.network.getBoundingBox(nodeId);
            boundingBoxes[nodeId] = position;
        });
    } catch (error) {
        console.warn('Unable to compute bounding boxes:', error);
    }
    return boundingBoxes;
}