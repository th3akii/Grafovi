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

        console.log('Parsed settings:', { nodeColor, edgeColor, nodeSize, lockMovement, preservePositions });

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
                    enabled: false
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