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

// Function to update edge font colors based on theme
function updateEdgeFontColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const fontColor = isDark ? '#ffffff' : '#000000';
    
    Object.keys(networkInstances).forEach(containerId => {
        const instance = networkInstances[containerId];
        if (instance && instance.network) {
            const edges = instance.network.body.data.edges.get();
            const updatedEdges = edges.map(edge => ({
                ...edge,
                font: {
                    ...(edge.font || {}),
                    color: fontColor,
                    background: 'none',
                    strokeWidth: 0
                }
            }));
            instance.network.body.data.edges.update(updatedEdges);
        }
    });
}

// Listen for theme changes
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                updateEdgeFontColors();
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
}

function renderGraph(containerId, nodesData, edgesData, isDirected, isWeighted, settings, dotNetHelper) {
    console.log("=== renderGraph START ===");
    console.log("Settings received:", settings);
    console.log("preservePositions value:", settings?.preservePositions);
    console.log("networkInstances[containerId] exists:", !!networkInstances[containerId]);

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
        // Normalize settings - support both Serbian and English property names
        settings = settings || {};
        var nodeColor = settings.nodeColor ?? settings.bojaCvora ?? '#97C2FC';
        var edgeColor = settings.edgeColor ?? settings.bojaGrane ?? '#2B7CE9';
        var nodeSize = settings.nodeSize ?? settings.velicinaCvora ?? 16;
        var lockMovement = settings.lockMovement ?? settings.zakljucanoPomeranje ?? false;
        var preservePositions = settings.preservePositions ?? settings.cuvajPoziciju ?? false;
        var omoguciMenjanjeGrana = settings.omoguciMenjanjeGrana ?? false;

        console.log('Parsed settings:', { nodeColor, edgeColor, nodeSize, lockMovement, preservePositions, omoguciMenjanjeGrana });

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

        // Handle parallel edges - add curvature to avoid overlap
        edgesArray = handleParallelEdges(edgesArray);

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

            instance.network.setOptions({
                interaction: {
                    dragNodes: !lockMovement,
                    dragView: true,
                    zoomView: true
                },
                manipulation: {
                    enabled: omoguciMenjanjeGrana,
                    editEdge: function(data, callback) {
                        console.log("editEdge pozvan sa:", data);
                        
                        // Proveri da li vec postoji petlja na ovom cvoru
                        if (data.from === data.to) {
                            var allEdges = instance.network.body.data.edges.get();
                            console.log("Sve grane:", allEdges);
                            
                            var existingLoop = allEdges.find(function(e) {
                                var sameLoop = e.from === data.from && e.to === data.to;
                                var differentId = String(e.id) !== String(data.id);
                                console.log(`Provera: ${e.id} - sameLoop: ${sameLoop}, differentId: ${differentId}`);
                                return sameLoop && differentId;
                            });
                            
                            if (existingLoop) {
                                console.log("Nađena postojeća petlja:", existingLoop);
                                alert('Već postoji petlja na ovom čvoru!');
                                callback(null);
                                return;
                            }
                        }
                        
                        callback(data);
                        if (dotNetHelper) {
                            console.log("Calling AzurirajGranu (update)", data);
                            dotNetHelper.invokeMethodAsync('AzurirajGranu', data.id, data.from, data.to)
                                .catch(err => console.error("Error calling AzurirajGranu:", err));
                        }
                        
                        // Ažuriraj sve grane da se reše paralele
                        var allEdges = instance.network.body.data.edges.get();
                        var updatedEdges = handleParallelEdges(allEdges);
                        instance.network.body.data.edges.update(updatedEdges);
                    },
                    addNode: false,
                    addEdge: false,
                    deleteNode: false,
                    deleteEdge: false
                },
                nodes: {
                    font: { size: nodeSize }
                },
                physics: {
                    enabled: false
                }
            });
            
            setupManipulationEvents(instance.network, container, omoguciMenjanjeGrana);

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
                        enabled: false
                    },
                    font: {
                        align: 'top',
                        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#ffffff' : '#000000',
                        background: 'none',
                        strokeWidth: 0
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
                },
                manipulation: {
                    enabled: omoguciMenjanjeGrana,
                    editEdge: function(data, callback) {
                        console.log("editEdge pozvan sa:", data);
                        
                        // Proveri da li vec postoji petlja na ovom cvoru
                        if (data.from === data.to) {
                            var allEdges = network.body.data.edges.get();
                            console.log("Sve grane:", allEdges);
                            
                            var existingLoop = allEdges.find(function(e) {
                                var sameLoop = e.from === data.from && e.to === data.to;
                                var differentId = String(e.id) !== String(data.id);
                                console.log(`Provera: ${e.id} - sameLoop: ${sameLoop}, differentId: ${differentId}`);
                                return sameLoop && differentId;
                            });
                            
                            if (existingLoop) {
                                console.log("Nađena postojeća petlja:", existingLoop);
                                alert('Već postoji petlja na ovom čvoru!');
                                callback(null);
                                return;
                            }
                        }
                        
                        callback(data);
                        if (dotNetHelper) {
                            console.log("Calling AzurirajGranu (new)", data);
                            dotNetHelper.invokeMethodAsync('AzurirajGranu', data.id, data.from, data.to)
                                .catch(err => console.error("Error calling AzurirajGranu:", err));
                        }
                        
                        // Ažuriraj sve grane da se reše paralele
                        var allEdges = network.body.data.edges.get();
                        var updatedEdges = handleParallelEdges(allEdges);
                        network.body.data.edges.update(updatedEdges);
                    },
                    addNode: false,
                    addEdge: false,
                    deleteNode: false,
                    deleteEdge: false
                }
            };

            // Destroy old if exists but we are not preserving
            if (networkInstances[containerId]) {
                networkInstances[containerId].network.destroy();
            }

            var network = new vis.Network(container, data, options);
            networkInstances[containerId] = { network: network, nodes: nodes, edges: edges };
            
            setupManipulationEvents(network, container, omoguciMenjanjeGrana);
        }

    } catch (error) {
        console.error("Error in renderGraph:", error);
        alert("Došlo je do greške prilikom iscrtavanja grafa: " + error.message);
    }
}

function setupManipulationEvents(network, container, enabled) {
    if (network._manipulationEventsAttached) {

    } else {
        // Track if we're currently in edit mode and which edge
        network._inEditMode = false;
        network._editingEdgeId = null;
        network._isDraggingControlPoint = false;
        network._justEnteredEditMode = false;
        
        // Helper function to exit edit mode
        function exitEditMode() {
            if (network._inEditMode) {
                console.log("Exiting edit mode");
                network._inEditMode = false;
                network._editingEdgeId = null;
                network._isDraggingControlPoint = false;
                network._justEnteredEditMode = false;
                network.disableEditMode();
            }
        }
        
        network.on("selectEdge", function(params) {
            if (network.manipulationEnabled && !network._inEditMode) {
                if (params.edges.length === 1 && params.nodes.length === 0) {
                    console.log("selectEdge -> Entering edit mode");
                    network._inEditMode = true;
                    network._editingEdgeId = params.edges[0];
                    network._justEnteredEditMode = true;
                    network.editEdgeMode();
                    
                    // Reset the flag after a short delay
                    setTimeout(function() {
                        network._justEnteredEditMode = false;
                    }, 300);
                }
            }
        });

        network.on("dragStart", function(params) {
            if (network.manipulationEnabled && network._inEditMode) {
                // User started dragging - likely a control point
                network._isDraggingControlPoint = true;
                console.log("dragStart in edit mode");
            }
        });

        network.on("dragEnd", function(params) {
            if (network.manipulationEnabled && network._inEditMode && network._isDraggingControlPoint) {
                console.log("dragEnd in edit mode -> Exiting");
                network._isDraggingControlPoint = false;
                exitEditMode();
            }
        });
        
        network.on("click", function(params) {
            if (network.manipulationEnabled) {
                console.log("click event", { inEditMode: network._inEditMode, justEntered: network._justEnteredEditMode, nodes: params.nodes.length, edges: params.edges.length });
                
                if (network._inEditMode) {
                    // Skip if we just entered edit mode (this is the same click that triggered entry)
                    if (network._justEnteredEditMode) {
                        console.log("Ignoring click - just entered edit mode");
                        return;
                    }
                    
                    // Check if clicked on the same edge we're editing
                    if (params.edges.length === 1 && params.edges[0] === network._editingEdgeId) {
                        console.log("Clicked on same edge - staying in edit mode");
                        return;
                    }
                    
                    // Exit edit mode for any other click
                    exitEditMode();
                    
                    // If clicked on a different edge, enter edit mode for that edge
                    if (params.edges.length === 1 && params.nodes.length === 0) {
                        var clickedEdgeId = params.edges[0];
                        setTimeout(function() {
                            console.log("Entering edit mode for clicked edge");
                            network._inEditMode = true;
                            network._editingEdgeId = clickedEdgeId;
                            network._justEnteredEditMode = true;
                            network.editEdgeMode();
                            setTimeout(function() {
                                network._justEnteredEditMode = false;
                            }, 300);
                        }, 50);
                    }
                } else {
                    // Not in edit mode
                    if (params.edges.length === 1 && params.nodes.length === 0) {
                        console.log("Edge click -> Entering edit mode");
                        network._inEditMode = true;
                        network._editingEdgeId = params.edges[0];
                        network._justEnteredEditMode = true;
                        network.editEdgeMode();
                        setTimeout(function() {
                            network._justEnteredEditMode = false;
                        }, 300);
                    }
                }
            }
        });
        
        // Handle Escape key to exit edit mode
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && network.manipulationEnabled && network._inEditMode) {
                console.log("Escape key -> Exiting edit mode");
                exitEditMode();
            }
        });
        
        // Handle clicks anywhere on the canvas to exit edit mode
        container.addEventListener('mouseup', function(e) {
            if (network.manipulationEnabled && network._inEditMode) {
                // Skip if we just entered edit mode
                if (network._justEnteredEditMode) {
                    console.log("mouseup ignored - just entered edit mode");
                    return;
                }
                
                // If we were dragging, dragEnd will handle it
                if (network._isDraggingControlPoint) {
                    console.log("mouseup after drag - dragEnd will handle");
                    return;
                }
                
                // Delay to let vis.js click event fire first
                setTimeout(function() {
                    // If still in edit mode after vis.js processed the click, exit
                    if (network._inEditMode && !network._isDraggingControlPoint && !network._justEnteredEditMode) {
                        console.log("Container mouseup -> Exiting edit mode");
                        exitEditMode();
                    }
                }, 200);
            }
        });
        
        network._manipulationEventsAttached = true;
    }
    
    // Update the state flag
    network.manipulationEnabled = enabled;

    // Handle CSS
    var styleId = 'vis-manipulation-hide';
    var existingStyle = document.getElementById(styleId);
    
    if (enabled) {
        if (!existingStyle) {
            var style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .vis-manipulation { display: none !important; }
                .vis-edit-mode .vis-button { display: none !important; }
                .vis-close { display: none !important; }
            `;
            document.head.appendChild(style);
        }
    } else {
        if (existingStyle) {
            existingStyle.remove();
        }
    }
}

// Handle parallel edges by adding curvature
function handleParallelEdges(edgesArray) {
    // Group edges by their node pair (regardless of direction)
    var edgeGroups = {};
    var selfLoops = {};
    
    edgesArray.forEach(function(edge, index) {
        // Check if this is a self-loop (petlja)
        if (edge.from === edge.to) {
            var nodeId = edge.from;
            if (!selfLoops[nodeId]) {
                selfLoops[nodeId] = [];
            }
            selfLoops[nodeId].push({ edge: edge, index: index });
        } else {
            // Create a key that's the same regardless of direction
            var nodeA = edge.from;
            var nodeB = edge.to;
            var key = nodeA < nodeB ? `${nodeA}-${nodeB}` : `${nodeB}-${nodeA}`;
            
            if (!edgeGroups[key]) {
                edgeGroups[key] = [];
            }
            edgeGroups[key].push({ edge: edge, index: index });
        }
    });
    
    // Apply curvature to parallel edges
    Object.keys(edgeGroups).forEach(function(key) {
        var group = edgeGroups[key];
        
        if (group.length === 1) {
            // Single edge - keep it straight
            group[0].edge.smooth = { enabled: false };
        } else {
            // Multiple edges between same nodes - add curvature
            var curveValues = getCurveValues(group.length);
            
            group.forEach(function(item, i) {
                item.edge.smooth = {
                    enabled: true,
                    type: 'curvedCW',
                    roundness: curveValues[i]
                };
            });
        }
    });
    
    // Handle multiple self-loops on the same node
    Object.keys(selfLoops).forEach(function(nodeId) {
        var loops = selfLoops[nodeId];
        
        if (loops.length === 1) {
            // Single self-loop
            loops[0].edge.smooth = {
                enabled: true,
                type: 'cubicBezier'
            };
        } else {
            // Multiple self-loops - make them different sizes
            loops.forEach(function(item, i) {
                // Increase size for each additional loop to avoid overlap
                var loopSize = 30 + (i * 25);
                item.edge.smooth = {
                    enabled: true,
                    type: 'cubicBezier',
                    forceDirection: 'none'
                };
                item.edge.selfReferenceSize = loopSize;
            });
        }
    });
    
    return edgesArray;
}

// Generate curve values for parallel edges
function getCurveValues(count) {
    var values = [];
    
    if (count === 2) {
        values = [0.4, -0.4];
    } else if (count === 3) {
        values = [0, 0.5, -0.5];
    } else if (count === 4) {
        values = [0.3, -0.3, 0.6, -0.6];
    } else {
        // For more edges, distribute evenly
        var step = 0.8 / Math.ceil(count / 2);
        for (var i = 0; i < count; i++) {
            var offset = Math.floor((i + 1) / 2) * step;
            values.push(i % 2 === 0 ? offset : -offset);
        }
    }
    
    return values;
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

// Settings Modal Management
var settingsModalElement = null;
var currentSettings = {
    bojaCvora: '#97C2FC',
    bojaGrane: '#2B7CE9',
    velicinaCvora: 16,
    cuvajPoziciju: false,
    zakljucanoPomeranje: false
};

function showSettingsModal(bojaCvora, bojaGrane, velicinaCvora, cuvajPoziciju, zakljucanoPomeranje) {
    console.log('showSettingsModal called', { bojaCvora, bojaGrane, velicinaCvora, cuvajPoziciju, zakljucanoPomeranje });
    
    // Store current settings
    currentSettings = {
        bojaCvora: bojaCvora || '#97C2FC',
        bojaGrane: bojaGrane || '#2B7CE9',
        velicinaCvora: velicinaCvora || 16,
        cuvajPoziciju: cuvajPoziciju || false,
        zakljucanoPomeranje: zakljucanoPomeranje || false
    };

    // Remove existing modal if any
    if (settingsModalElement) {
        document.body.removeChild(settingsModalElement);
    }

    // Create modal HTML
    var modalHTML = `
        <div class="modal-backdrop" id="settingsModalBackdrop" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        ">
            <div class="modal" onclick="event.stopPropagation()" style="
                background: white;
                border-radius: 12px;
                width: 400px;
                max-width: 90vw;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                overflow: hidden;
            ">
                <div class="modal-header" style="
                    padding: 16px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="margin: 0; font-size: 18px; color: #1f2937;">Podešavanja Vizualizacije</h3>
                    <button onclick="window.closeSettingsModal()" class="close-btn" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        color: #9ca3af;
                        cursor: pointer;
                        padding: 0;
                        line-height: 1;
                    ">×</button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <div class="input-group" style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Boja čvorova</label>
                        <input type="color" id="bojaCvoraInput" value="${currentSettings.bojaCvora}" style="
                            width: 100%;
                            height: 40px;
                            padding: 2px;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            cursor: pointer;
                        " />
                    </div>
                    <div class="input-group" style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Boja grana</label>
                        <input type="color" id="bojaGraneInput" value="${currentSettings.bojaGrane}" style="
                            width: 100%;
                            height: 40px;
                            padding: 2px;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            cursor: pointer;
                        " />
                    </div>
                    <div class="input-group" style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">Veličina čvorova (<span id="velicinaCvoraValue">${currentSettings.velicinaCvora}</span>)</label>
                        <input type="range" id="velicinaCvoraInput" value="${currentSettings.velicinaCvora}" min="10" max="50" 
                            oninput="document.getElementById('velicinaCvoraValue').textContent = this.value"
                            style="width: 100%; margin-top: 8px;" />
                    </div>
                    <div class="input-group-inline" style="margin-bottom: 16px;">
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer;">
                            <span>Zadrži pozicije (ne resetuj graf)</span>
                            <input type="checkbox" id="cuvajPozicijuInput" ${currentSettings.cuvajPoziciju ? 'checked' : ''} style="
                                width: 18px;
                                height: 18px;
                                cursor: pointer;
                                margin: 0;
                            " />
                        </label>
                    </div>
                    <div class="input-group-inline" style="margin-bottom: 16px;">
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer;">
                            <span>Zaključaj pomeranje</span>
                            <input type="checkbox" id="zakljucanoPomeranjeInput" ${currentSettings.zakljucanoPomeranje ? 'checked' : ''} style="
                                width: 18px;
                                height: 18px;
                                cursor: pointer;
                                margin: 0;
                            " />
                        </label>
                    </div>
                </div>
                <div class="modal-footer" style="
                    padding: 16px 20px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: flex-end;
                ">
                    <button onclick="window.applySettingsFromModal()" style="
                        padding: 10px 16px;
                        border: none;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        background: #000;
                        color: white;
                    ">Primeni</button>
                </div>
            </div>
        </div>
    `;

    // Create element
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    settingsModalElement = tempDiv.firstElementChild;
    
    // Add click handler to backdrop
    settingsModalElement.addEventListener('click', function() {
        window.closeSettingsModal();
    });

    // Append to body
    document.body.appendChild(settingsModalElement);
}

function hideSettingsModal() {
    console.log('hideSettingsModal called');
    if (settingsModalElement && settingsModalElement.parentNode) {
        document.body.removeChild(settingsModalElement);
        settingsModalElement = null;
    }
}

function getSettingsData() {
    if (!settingsModalElement) {
        return currentSettings;
    }

    return {
        bojaCvora: document.getElementById('bojaCvoraInput')?.value || currentSettings.bojaCvora,
        bojaGrane: document.getElementById('bojaGraneInput')?.value || currentSettings.bojaGrane,
        velicinaCvora: parseInt(document.getElementById('velicinaCvoraInput')?.value) || currentSettings.velicinaCvora,
        cuvajPoziciju: document.getElementById('cuvajPozicijuInput')?.checked || false,
        zakljucanoPomeranje: document.getElementById('zakljucanoPomeranjeInput')?.checked || false
    };
}

// Global functions for modal
window.closeSettingsModal = function() {
    hideSettingsModal();
    // Notify Blazor that modal was closed
    if (window.DotNet) {
        // We'll handle this in Blazor
    }
};

window.applySettingsFromModal = function() {
    var settings = getSettingsData();
    console.log('Applying settings:', settings);
    
    // Update current settings
    currentSettings = settings;
    
    // Close modal
    hideSettingsModal();
    
    // Trigger Blazor callback
    if (window.blazorSettingsCallback) {
        window.blazorSettingsCallback.invokeMethodAsync('ApplySettingsFromModal');
    }
};

function registerBlazorCallback(dotNetObject) {
    window.blazorSettingsCallback = dotNetObject;
    console.log('Blazor callback registered');
}