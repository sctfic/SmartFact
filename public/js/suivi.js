// Suivi / Propals logic

/**
 * Génère un SVG de facture/invoice (30x40px, niveaux de gris)
 * @param {number} itemCount - Nombre d'items/lignes
 * @returns {string} SVG de la facture
 */
function generateInvoiceSVG(itemCount) {
    // Limiter entre 1 et 10
    itemCount = Math.max(1, Math.min(10, itemCount));

    const width = 30;
    const height = 40;

    // Calcul des zones
    const headerHeight = 3;
    const clientInfoY = 4.5;
    const clientInfoHeight = 5;
    const tableY = 10;
    const tableHeaderHeight = 2.2;
    const footerHeight = 2.5;
    const totalsHeight = 3.5;
    const footerY = height - footerHeight;
    const totalsY = footerY - totalsHeight;

    // Hauteur disponible pour les items
    const availableHeight = totalsY - tableY - tableHeaderHeight;
    const itemSpacing = availableHeight / itemCount;

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Fond de la facture
    svg += `
        <rect width="${width}" height="${height}" fill="#ffffff" stroke="#000000" stroke-width="0.3"/>
    `;

    // Zone 1: En-tête
    svg += `
        <rect x="1" y="1" width="28" height="${headerHeight}" fill="#e0e0e0" stroke="#000" stroke-width="0.2"/>
        <line x1="5" y1="1.8" x2="25" y2="1.8" stroke="#000" stroke-width="0.5"/>
        <line x1="8" y1="2.5" x2="22" y2="2.5" stroke="#000" stroke-width="0.4"/>
    `;

    // Zone 2: Infos client (gauche)
    svg += `
        <rect x="1" y="${clientInfoY}" width="13" height="${clientInfoHeight}" fill="#f0f0f0" stroke="#000" stroke-width="0.2"/>
        <line x1="3" y1="5.2" x2="11" y2="5.2" stroke="#000" stroke-width="0.4"/>
        <line x1="3" y1="6" x2="9" y2="6" stroke="#000" stroke-width="0.4"/>
    `;

    // Zone 3: Infos entreprise (droite)
    svg += `
        <rect x="14.5" y="${clientInfoY}" width="14.5" height="${clientInfoHeight}" fill="#f0f0f0" stroke="#000" stroke-width="0.2"/>
        <line x1="16" y1="5.2" x2="27" y2="5.2" stroke="#000" stroke-width="0.4"/>
        <line x1="16" y1="6" x2="24" y2="6" stroke="#000" stroke-width="0.4"/>
    `;

    // Zone 4: Tableau
    const tableHeight = totalsY - tableY;
    svg += `
        <rect x="1" y="${tableY}" width="28" height="${tableHeight}" fill="#fff" stroke="#000" stroke-width="0.2"/>
    `;

    // Colonne séparatrice prix/descriptif
    svg += `
        <line x1="22" y1="${tableY}" x2="22" y2="${totalsY}" stroke="#000" stroke-width="0.3"/>
    `;

    // En-tête du tableau
    svg += `
        <rect x="1" y="${tableY}" width="28" height="${tableHeaderHeight}" fill="#d0d0d0"/>
        <line x1="22" y1="${tableY}" x2="22" y2="${tableY + tableHeaderHeight}" stroke="#000" stroke-width="0.3"/>
    `;

    // Générer les items selon itemCount
    const startY = tableY + tableHeaderHeight;
    const descriptifLengths = [19, 13, 8, 19, 16, 14, 11, 18, 10, 17, 12, 15]; // Longueurs variées
    const prixLengths = [4, 3, 5, 2, 4, 3, 5, 4, 3, 4, 5, 3]; // Longueurs de prix variées

    for (let i = 0; i < itemCount; i++) {
        const itemY = startY + (i * itemSpacing) + 0.8;
        const descriptifLength = descriptifLengths[i % descriptifLengths.length];
        const prixLength = prixLengths[i % prixLengths.length];

        // Ligne descriptif
        svg += `
            <line x1="2" y1="${itemY}" x2="${2 + descriptifLength}" y2="${itemY}" stroke="#000" stroke-width="0.5"/>
        `;

        // Ligne prix
        svg += `
            <line x1="23" y1="${itemY}" x2="${23 + prixLength}" y2="${itemY}" stroke="#000" stroke-width="0.5"/>
        `;

        // Séparation entre items (sauf après le dernier)
        if (i < itemCount - 1) {
            const separatorY = startY + ((i + 1) * itemSpacing);
            svg += `
                <line x1="1" y1="${separatorY}" x2="29" y2="${separatorY}" stroke="#000" stroke-width="0.15"/>
            `;
        }
    }

    // Zone 5: Totaux (bas-droite) avec symbole €
    svg += `
        <rect x="17" y="${totalsY}" width="12" height="${totalsHeight}" fill="#e8e8e8" stroke="#000" stroke-width="0.2"/>
        <line x1="18" y1="${totalsY + 1}" x2="27" y2="${totalsY + 1}" stroke="#000" stroke-width="0.4"/>
        <line x1="18" y1="${totalsY + 2}" x2="28" y2="${totalsY + 2}" stroke="#000" stroke-width="0.4"/>
    `;

    // Symbole € dans la zone totaux
    svg += `
        <text x="20" y="${totalsY + 2.8}" font-family="Arial" font-size="2" fill="#000" font-weight="bold">TOTAL €</text>
    `;

    // Zone 6: Pied de page
    svg += `
        <rect x="1" y="${footerY}" width="28" height="${footerHeight}" fill="#f0f0f0" stroke="#000" stroke-width="0.2"/>
        <line x1="3" y1="${footerY + 0.7}" x2="27" y2="${footerY + 0.7}" stroke="#000" stroke-width="0.3"/>
        <line x1="5" y1="${footerY + 1.5}" x2="25" y2="${footerY + 1.5}" stroke="#000" stroke-width="0.3"/>
    `;

    svg += `</svg>`;

    return svg;
}

// Load suivi data
async function loadSuiviData() {
    console.log('loadSuiviData');
    try {
        const [suiviData, tarifsData, clientsData] = await Promise.all([
            fetch('/api/suivi').then(r => r.json()),
            fetch('/api/tarifs').then(r => r.json()),
            fetch('/api/clients').then(r => r.json())
        ]);
        window.availableTarifs = tarifsData;
        window.availableClients = clientsData;
        window.propalData = suiviData; // Store globally for filtering

        // Apply filters (which includes sorting and population)
        if (window.applyPropalFilters) window.applyPropalFilters();
        else populateSuiviTable(suiviData, tarifsData);

        populateTarifsSelect(tarifsData);
    } catch (error) {
        console.error('Error loading suivi data:', error);
    }
}

// Populate client select dropdown
async function populateClientsSelect() {
    console.log('populateClientsSelect');
    try {
        const response = await fetch('/api/clients');
        const clients = await response.json();
        const select = document.getElementById('PropalClientSelect');

        // Clear existing options except first one
        select.innerHTML = '<option value="">-- Sélectionner un client --</option>';

        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.nom} ${client.prenom}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating clients:', error);
    }
}

// Helper to map string status to numeric workflow ID
function mapStatusToId(status) {
    if (!status) return 0;
    const s = status.toUpperCase();
    if (s.includes('BROUILLON')) return 0;
    if (s.includes('ENVOY')) return 1;
    if (s.includes('PERDU')) return 2;
    if (s.includes('GAGN')) return 3;
    if (s.includes('EFFECTU')) return 4;
    if (s.includes('À PAYER') || s.includes('A PAYER')) return 6;
    if (s.includes('RELANC')) return 7;
    if (s.includes('PAY')) return 9;
    return 0;
}

// Populate suivi table
function populateSuiviTable(data, tarifs = []) {
    console.log('populateSuiviTable');
    const tbody = document.querySelector('#PropalsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        const date = new Date(item.date_heure).toLocaleDateString('fr-FR');

        // Calculs dynamiques
        let totalDureeMins = 0;
        let totalMontant = 0;
        let hasItems = false;

        let itemsMap = {};
        try {
            if (item.id_tarifs && item.id_tarifs !== 'undefined') {
                itemsMap = typeof item.id_tarifs === 'string' ? JSON.parse(item.id_tarifs) : item.id_tarifs;
            }
        } catch (e) { }

        if (itemsMap && Object.keys(itemsMap).length > 0 && tarifs.length > 0) {
            hasItems = true;
            Object.entries(itemsMap).forEach(([tid, details]) => {
                const t = tarifs.find(x => x.id === tid);
                if (t) {
                    const q = details.qtt || 0;
                    totalMontant += parseFloat(t.prix || 0) * q;
                    totalDureeMins += timeToMinutes(t.timeByUnits || t.duree || '00:00') * q;
                }
            });
        }

        const displayMontant = hasItems ? totalMontant.toFixed(2) : parseFloat(item.montant || 0).toFixed(2);
        const displayDuree = hasItems ? minutesToTime(totalDureeMins) : (item.duree || '00:00');

        const workflowId = `workflow-${item.id}`;

        // Compter le nombre d'items pour le SVG
        let itemCount = 0;
        if (itemsMap && Object.keys(itemsMap).length > 0) {
            itemCount = Object.keys(itemsMap).length;
        }
        const detailsSVG = generateInvoiceSVG(itemCount);

        row.addEventListener('dblclick', function (e) {
            // Ne pas éditer si on clique sur id_tarifs (prioritaire)
            if (!e.target.closest('td.id_tarifs')) {
                editPropalRow(this, item.id);
            }
        });

        row.innerHTML = `
            <td class="id">${item.id}</td>
            <td class="devis_number">${item.devis_number || ''}</td>
            <td class="id_client">${item.client_name || item.id_client || ''}</td>
            <td class="id_tarifs" style="padding: 4px; cursor: pointer; text-align: center;" onclick="openTarifsModal(event)">${detailsSVG}</td>
            <td>${date}</td>
            <td>${displayDuree}</td>
            <td>${displayMontant} €</td>
            <td style="padding: 0; min-width: 290px;"><div id="${workflowId}" style="transform: scale(0.95); transform-origin: left center;"></div></td>
            <td>${item.mode_paiement || ''}</td>
            <td>${item.date_paiement || ''}</td>
            <td>${item.invoice_number || ''}</td>
            <td class="actions-cell">
                <button class="btn-icon" title="Dupliquer" onclick="/* TODO: duplicate logic */">
                    <svg viewBox="0 0 18 18"><path d="M8 7v7h5V7H8zM3.99 2h7.942v2H4.985v8H3V2.995A1 1 0 0 1 3.99 2zM6 5.996c0-.55.446-.996.998-.996h7.004c.55 0 .998.445.998.996v9.008c0 .55-.446.996-.998.996H6.998A.996.996 0 0 1 6 15.004V5.996z" fill-rule="evenodd"></path></svg>
                </button>
                <button class="btn-icon" title="Supprimer" onclick="deletePropal('${item.id}')">
                    <svg viewBox="0 0 18 18"><path d="M6.5 3c0-.552.444-1 1-1h3c.552 0 1 .444 1 1H15v2H3V3h3.5zM4 6h10v8c0 1.105-.887 2-2 2H6c-1.105 0-2-.887-2-2V6z" fill-rule="evenodd"></path></svg>
                </button>
            </td>
        `;
        tbody.appendChild(row);

        // Initialize workflow visualization
        const statusId = mapStatusToId(item.statut);
        setTimeout(() => {
            if (typeof workflow === 'function') {
                // Determine relevant date for checks
                let comparisonDate = item.date_heure;
                // For payment check, we might want date_emission or date_echeance if available,
                // otherwise date_heure matches creation.
                // item.date_paiement is mostly for successful payment.
                // For 'Relancer', we check if we are waiting for payment too long.

                workflow(workflowId, statusId, {
                    date: comparisonDate,
                    onCheckboxChange: async (checked, s) => {
                        console.log('Checkbox changed for', item.id, checked);

                        let newStatusString = null;
                        // Logique de transition d'état basée sur la case cochée
                        if (checked) {
                            if (s === 1) newStatusString = 'GAGNEE';
                            else if (s === 6) newStatusString = 'PAYEE';
                            else if (s === 7) newStatusString = 'PAYEE';
                        } else {
                            // Retour en arrière
                            if (s === 1) newStatusString = 'ENVOYEE'; // On décoche Gagné (depuis Gagné) ou Perdu?
                            else if (s === 6) newStatusString = 'A PAYER'; // On décoche Payée
                        }

                        if (newStatusString) {
                            try {
                                const response = await fetch(`/api/suivi/${item.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ statut: newStatusString })
                                });

                                if (response.ok) {
                                    // Recharger les données pour mettre à jour l'affichage
                                    loadSuiviData();
                                } else {
                                    console.error('Erreur mise à jour statut');
                                }
                            } catch (err) {
                                console.error('Erreur réseau mise à jour statut', err);
                            }
                        }
                    },
                    onEmailClick: async (s) => {
                        console.log('Email clicked for', item.id, s);
                        let newStatusString = null;

                        // Si étape 4 (Effectué) -> on envoie la facture -> devient À PAYER (6)
                        if (s === 4) newStatusString = 'A PAYER';

                        // Si étape 0 (Brouillon) -> on envoie le devis -> devient ENVOYEE (1)
                        if (s === 0) newStatusString = 'ENVOYEE';

                        // Si étape 7 (Relancer) -> on renvoie la facture -> reste À PAYER (6) ou spécifique
                        if (s === 7) newStatusString = 'A PAYER';

                        if (newStatusString) {
                            try {
                                const response = await fetch(`/api/suivi/${item.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ statut: newStatusString })
                                });
                                if (response.ok) loadSuiviData();
                            } catch (err) {
                                console.error('Erreur réseau update statut email', err);
                            }
                        }
                    }
                });
            }
        }, 0);
    });
}

// Inline editing for Propals
window.currentPropalRow = null;
window.currentPropalDetails = {};

function addPropalRow(preselectedClientId = null) {
    console.log('addPropalRow', preselectedClientId);
    // Save/Close existing edit first
    if (window.currentEditingRow) {
        const table = window.currentEditingRow.closest('table');
        if (table) {
            if (table.id === 'tarifsTable') saveTarifRow(window.currentEditingRow);
            else if (table.id === 'clientsTable') saveClientRow(window.currentEditingRow);
            else if (table.id === 'PropalsTable') savePropalRow(window.currentEditingRow);
        }
    }

    const tbody = document.querySelector('#PropalsTable tbody');
    const row = document.createElement('tr');
    row.classList.add('editing-row');

    // Définir la date par défaut à J+28 pour l'échéance ou J en date de création?
    // Le champ s'appelle 'date_heure', on suppose que c'est la date de création/émission.
    // Si c'est l'échéance, J+28 est logique. Si c'est création, J est mieux.
    // "date_heure" dans la table "suivi" du schema non fourni, mais souvent date creation.
    // Le user avait mis new Date().
    // Le user a mis plus haut J+28 dans son propre code (Step 431). Je vais respecter ça.

    const defaultDateVal = new Date();
    defaultDateVal.setDate(defaultDateVal.getDate() + 28);
    const formattedDefaultDate = defaultDateVal.toISOString().slice(0, 16);

    const detailsSVG = generateInvoiceSVG(0);

    row.innerHTML = `
        <td style="display:none;"><input type="text" name="id" class="form-input" disabled></td>
        <td><input type="text" name="devis_number" class="form-input" placeholder="#" disabled></td>
        <td>
            <select name="id_client" class="form-input" required onchange="updatePropalDefaults(this)">
                <option value="">Sélectionner un client</option>
                ${window.availableClients ? window.availableClients.map(c => `<option value="${c.id}" ${c.id == preselectedClientId ? 'selected' : ''}>${c.nom} ${c.prenom}</option>`).join('') : ''}
            </select>
        </td>
        <td style="padding: 4px; cursor: pointer; text-align: center;" onclick="openTarifsModal(event)">${detailsSVG}</td>
        <td><input type="datetime-local" name="date_heure" class="form-input" value="${formattedDefaultDate}" required></td>
        <td><input type="text" name="duree" class="form-input" placeholder="HH:MM" disabled></td>
        <td><input type="number" name="montant" class="form-input" step="0.01" placeholder="Montant" disabled></td>
        <td><input type="text" name="statut" class="form-input" value="draft" disabled></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="actions-cell">
            <button class="btn-icon" title="Sauvegarder" onclick="savePropalRow(this.closest('tr'))">
               <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </button>
            <button class="btn-icon" title="Annuler" onclick="loadSuiviData()">
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
        </td>
    `;
    tbody.prepend(row);
    window.currentPropalRow = row;
    window.currentPropalDetails = {};
    window.currentEditingRow = row;

    // Trigger default updates if client preselected
    if (preselectedClientId) {
        const select = row.querySelector('select[name="id_client"]');
        if (select) {
            updatePropalDefaults(select);
        }
    }

    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function createPropalForClient(clientId) {
    console.log('createPropalForClient', clientId);
    // Switch to Suivi view
    showSection('viewPropals');
    // After switching (not reloading if already loaded), add the propal row
    // If we need to load data first, wait for it
    setTimeout(() => {
        // Make sure we have the data (should be cached if section was already loaded)
        if (!window.availableClients || window.availableClients.length === 0) {
            loadSuiviData().then(() => {
                addPropalRow(clientId);
            });
        } else {
            // Data already loaded, just add the row
            addPropalRow(clientId);
        }
    }, 100);
}

function editPropalRow(row, id) {
    console.log('editPropalRow', id);
    enterEditMode(row, () => {
        const data = window.propalData.find(item => item.id == id);
        if (!data) return;

        window.currentPropalRow = row;
        window.currentPropalDetails = (data.id_tarifs.startsWith('{"') ? JSON.parse(data.id_tarifs) : data.id_tarifs) || {};

        // Compter le nombre d'items pour le SVG
        let itemCount = 0;
        if (window.currentPropalDetails && Object.keys(window.currentPropalDetails).length > 0) {
            itemCount = Object.keys(window.currentPropalDetails).length;
        }
        const detailsSVG = generateInvoiceSVG(itemCount);

        row.dataset.id = id;
        row.innerHTML = `
            <td class="id">${data.id}</td>
            <td class="devis_number">${data.devis_number || ''}</td>
            <td>
                <select name="id_client" class="form-input" required onchange="updatePropalDefaults(this)">
                    <option value="">Sélectionner un client</option>
                    ${window.availableClients ? window.availableClients.map(c => `<option value="${c.id}" ${c.id == data.id_client || c.nom === data.client_name ? 'selected' : ''}>${c.nom} ${c.prenom}</option>`).join('') : ''}
                </select>
            </td>
            <td style="padding: 4px; cursor: pointer; text-align: center;" onclick="openTarifsModal(event)">${detailsSVG}</td>
            <td><input type="datetime-local" name="date_heure" class="form-input" value="${data.date_heure}" required></td>
            <td><input type="text" name="duree" class="form-input" value="${data.duree || ''}" disabled></td>
            <td><input type="number" name="montant" class="form-input" step="0.01" value="${data.montant || ''}" disabled></td>
            <td><input type="text" name="statut" class="form-input" value="${data.statut}" disabled></td>
            <td>${data.mode_paiement || ''}</td>
            <td>${data.date_paiement || ''}</td>
            <td>${data.invoice_number || ''}</td>
            <td class="actions-cell">
                <button class="btn-icon" title="Sauvegarder" onclick="savePropalRow(this.closest('tr'))">
                   <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </button>
                <button class="btn-icon" title="Annuler" onclick="loadSuiviData()">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
            </td>
        `;

        // Don't auto-update defaults on edit start unless necessary?
        // updatePropalDefaults might override existing values if client changed?
        // No, we only change if user changes select.
    });
}

function updatePropalDefaults(selectElement) {
    const clientId = selectElement.value;
    const client = window.availableClients.find(c => c.id == clientId);
    const row = selectElement.closest('tr');

    if (client && row) {
        // Apply default tarif with quantity = client distance
        const defaultTarif = window.availableTarifs.find(t => t.default && (t.default === 'true' || t.default === 'True' || t.default === '1'));
        if (defaultTarif) {
            window.currentPropalDetails = {};
            window.currentPropalDetails[defaultTarif.id] = {
                qtt: parseFloat(client.distance) || 1,
                detail: client.Comment
            };
            updatePropalCalculations(row);
        }
    }
}

function openTarifsModal(event) {
    console.log('openTarifsModal', event);
    
    // Récupérer la row à partir du click
    let row = window.currentPropalRow;
    if (event && !row) {
        row = event.target.closest('tr');
    }
    
    if (!row) {
        console.error('Row not found');
        return;
    }

    window.currentPropalRow = row;

    // Récupérer l'ID de la propal depuis la row
    const itemId = row.querySelector('td.id')?.textContent;
    console.log('itemId:', itemId);
    
    // Vérifier si la row est en édition (a des inputs)
    const hasInputs = row.querySelector('input[name="duree"]') !== null;
    console.log('hasInputs:', hasInputs);
    
    if (!hasInputs && itemId) {
        // La row n'est pas en édition, il faut passer en mode édition
        console.log('Basculage en mode édition avant ouverture de la modale');
        editPropalRow(row, itemId);
        // editPropalRow va mettre les inputs dans la row, puis on ouvre la modale
        // On rappelle openTarifsModal après un petit délai
        setTimeout(() => {
            showPropalDetails({ 
                preventDefault: () => { },
                target: { closest: () => window.currentPropalRow }
            });
        }, 50);
        return;
    }
    
    if (itemId) {
        // Trouver la propal dans les données
        const propal = window.propalData?.find(p => p.id === itemId);
        if (propal) {
            // Parser id_tarifs
            window.currentPropalDetails = (propal.id_tarifs.startsWith('{"') ? JSON.parse(propal.id_tarifs) : propal.id_tarifs) || {};
        }
    }

    // Afficher la modale
    const event2 = {
        preventDefault: () => { },
        target: {
            closest: () => window.currentPropalRow
        }
    };

    showPropalDetails(event2);
}

function showPropalDetails(event) {
    console.log('showPropalDetails');
    event.preventDefault();
    const row = event.target.closest('tr');
    window.currentPropalRow = row;

    console.log('id_tarifs avant cleanup:', window.currentPropalDetails);

    // Nettoyer les tarifs qui n'existent plus
    Object.keys(window.currentPropalDetails).forEach(tarifId => {
        const tarif = window.availableTarifs.find(t => t.id === tarifId);
        if (!tarif) {
            console.log(`Suppression du tarif ${tarifId} qui n'existe plus`);
            delete window.currentPropalDetails[tarifId];
        }
    });

    console.log('id_tarifs après cleanup:', window.currentPropalDetails);

    // Show modal for tarif selection
    const modal = document.getElementById('invoiceItemsModal');
    if (!modal) {
        alert("Modal not found");
        return;
    }

    // Récupérer le tbody existant de la modale
    const tbody = modal.querySelector('tbody');
    if (!tbody) {
        alert("Table body not found in modal");
        return;
    }

    // Vider et remplir le tbody avec SEULEMENT les tarifs sélectionnés
    tbody.innerHTML = '';
    Object.entries(window.currentPropalDetails).forEach(([tarifId, details]) => {
        const tarif = window.availableTarifs.find(t => t.id === tarifId);
        if (!tarif) return;

        const qtt = details.qtt || 0;
        const detail = details.detail || '';
        const prix = parseFloat(tarif.prix) || 0;
        const total = (qtt * prix).toFixed(2);

        const row = document.createElement('tr');
        console.log(tarif);
        row.innerHTML = `
            <td><span style="font-weight: bold;">${tarif.libelle}</span></td>
            <td><input type="text" class="tarif-detail" data-tarif-id="${tarif.id}" value="${detail}" placeholder="Détail" onchange="updatePropalDetails(this)"></td>
            <td><input type="number" class="tarif-qtt" data-tarif-id="${tarif.id}" value="${qtt}" min="0" step="1" onchange="updatePropalDetails(this)"></td>
            <td>${tarif.Unit || ''}</td>
            <td>${prix.toFixed(2)} €</td>
            <td><button class="btn-icon" onclick="removePropalTarif('${tarifId}')">✕</button></td>
        `;
        tbody.appendChild(row);
    });

    modal.classList.remove('hidden');

    // Setup autocomplete for tarif search if not already set
    if (!modal.dataset.autocompleteSetup) {
        const searchInput = modal.querySelector('#tarifSearch');
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            const suggestions = modal.querySelector('#tarifSuggestions');

            if (query.length === 0) {
                suggestions.style.display = 'none';
                return;
            }

            const filtered = window.availableTarifs.filter(t =>
                t.libelle.toLowerCase().includes(query) &&
                !window.currentPropalDetails[t.id]
            );

            if (filtered.length === 0) {
                suggestions.style.display = 'none';
                return;
            }

            suggestions.innerHTML = filtered.map(t =>
                `<div style="padding:8px; border-bottom:1px solid #eee; cursor:pointer;" onclick="selectTarifFromSuggestion('${t.id}', '${t.libelle.replace(/'/g, "\\'")}', '${t.Comment?.replace(/'/g, "\\'") || ''}')">${t.libelle}</div>`
            ).join('');
            suggestions.style.display = 'block';
        });
        modal.dataset.autocompleteSetup = 'true';
    }
}

function updatePropalDetails(input) {
    const tarifId = input.dataset.tarifId;

    if (input.classList.contains('tarif-qtt')) {
        // Mise à jour de la quantité
        const qtt = parseFloat(input.value) || 0;

        if (qtt > 0) {
            if (!window.currentPropalDetails[tarifId]) {
                // Si le tarif n'existe pas encore, créer une entrée avec le comment du tarif
                const tarif = window.availableTarifs.find(t => t.id === tarifId);
                window.currentPropalDetails[tarifId] = {
                    qtt: qtt,
                    detail: tarif?.Comment || ""
                };
            } else {
                window.currentPropalDetails[tarifId].qtt = qtt;
            }
        } else {
            delete window.currentPropalDetails[tarifId];
        }
    } else if (input.classList.contains('tarif-detail')) {
        // Mise à jour du détail
        const detail = input.value;
        if (window.currentPropalDetails[tarifId]) {
            window.currentPropalDetails[tarifId].detail = detail;
        }
    }
}

function updatePropalCalculations(row) {
    if (!row) return;

    // Nettoyer les tarifs qui n'existent plus
    Object.keys(window.currentPropalDetails).forEach(tarifId => {
        const tarif = window.availableTarifs.find(t => t.id === tarifId);
        if (!tarif) {
            console.log(`Suppression du tarif ${tarifId} qui n'existe plus lors du calcul`);
            delete window.currentPropalDetails[tarifId];
        }
    });

    let totalDuree = 0;
    let totalMontant = 0;
    const idTarifs = {};

    Object.keys(window.currentPropalDetails).forEach(tarifId => {
        const detail = window.currentPropalDetails[tarifId];
        const tarif = window.availableTarifs.find(t => t.id === tarifId);

        if (tarif) {
            idTarifs[tarifId] = detail;
            totalMontant += (parseFloat(tarif.prix) * detail.qtt);

            // Parse duree and multiply by quantity
            const [hours, mins] = (tarif.timeByUnits || '00:00').split(':');
            const mins_total = (parseInt(hours) * 60 + parseInt(mins)) * detail.qtt;
            totalDuree += mins_total;
        }
    });

    // Format duree as HH:MM
    const hours = Math.floor(totalDuree / 60);
    const mins = totalDuree % 60;
    const dureeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    // Update fields
    console.log('updatePropalCalculations - row:', row);
    console.log('updatePropalCalculations - row.tagName:', row?.tagName);
    console.log('updatePropalCalculations - row.innerHTML:', row?.innerHTML);
    
    const dureeInput = row.querySelector('input[name="duree"]');
    const montantInput = row.querySelector('input[name="montant"]');
    
    console.log('dureeInput:', dureeInput);
    console.log('montantInput:', montantInput);
    
    if (dureeInput) dureeInput.value = dureeStr;
    if (montantInput) montantInput.value = totalMontant.toFixed(2);
    
    row.dataset.tarifDetails = JSON.stringify(idTarifs);

    // Enregistrer automatiquement via l'API
    savePropalRow(row);
}

async function savePropalRow(row) {
    console.log('savePropalRow');
    const id = row.dataset.id;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/suivi/${id}` : '/api/suivi';

    const payload = {
        date_heure: row.querySelector('input[name="date_heure"]').value,
        id_client: row.querySelector('select[name="id_client"]').value,
        statut: row.querySelector('input[name="statut"]').value || 'draft', // Keep existing statut if editing
        id_tarifs: window.currentPropalDetails,
        duree: row.querySelector('input[name="duree"]').value,
        montant: row.querySelector('input[name="montant"]').value
    };

    if (!payload.date_heure || !payload.id_client) {
        alert("La date et le client sont obligatoires.");
        return;
    }

    if (Object.keys(payload.id_tarifs).length === 0) {
        alert("Vous devez sélectionner au moins un tarif.");
        return;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            window.currentEditingRow = null;
            loadSuiviData(); // Refresh table
        } else {
            const err = await response.json();
            alert("Erreur: " + (err.message || "Erreur inconnue"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Erreur réseau");
    }
}

async function deletePropal(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette propal ?')) return;
    try {
        const response = await fetch(`/api/suivi/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadSuiviData();
        } else {
            alert('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

window.applyPropalFilters = () => {
    if (!window.propalData) return;

    let filtered = window.propalData.filter(item => {
        // Column filters
        const colFilters = window.tableState.propals.colFilters;
        for (const [col, val] of Object.entries(colFilters)) {
            if (!val) continue;
            let itemVal = (item[col] || '').toString().toLowerCase();
            // Special handling for calculated/lookup fields?
            // item.client_name is populated in loadSuiviData backend? Yes.
            if (!itemVal.includes(val)) return false;
        }
        return true;
    });

    // Sorting
    const { sortCol, sortDesc } = window.tableState.propals;
    if (sortCol) {
        filtered.sort((a, b) => {
            let valA = a[sortCol] || '';
            let valB = b[sortCol] || '';

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortDesc ? 1 : -1;
            if (valA > valB) return sortDesc ? -1 : 1;
            return 0;
        });
    }

    populateSuiviTable(filtered, window.availableTarifs);
};

function addPropalTarifItem() {
    const modal = document.getElementById('invoiceItemsModal');
    const searchInput = modal.querySelector('#tarifSearch');
    const query = searchInput.value.toLowerCase();

    // Trouver le tarif correspondant à la recherche
    const tarif = window.availableTarifs.find(t =>
        t.libelle.toLowerCase().includes(query) &&
        !window.currentPropalDetails[t.id]
    );

    if (!tarif) {
        alert("Tarif non trouvé ou déjà sélectionné");
        return;
    }

    selectTarifFromSuggestion(tarif.id, tarif.libelle, tarif.Comment || '');
}

function selectTarifFromSuggestion(tarifId, tarifLibelle, tarifComment) {
    // Ajouter le tarif à currentPropalDetails avec qtt = 1 et detail = comment
    if (!window.currentPropalDetails[tarifId]) {
        window.currentPropalDetails[tarifId] = {
            qtt: 1,
            detail: tarifComment
        };
    }

    // Vider le search input
    const modal = document.getElementById('invoiceItemsModal');
    const searchInput = modal.querySelector('#tarifSearch');
    searchInput.value = '';
    const suggestions = modal.querySelector('#tarifSuggestions');
    suggestions.style.display = 'none';
    suggestions.innerHTML = '';

    // Rafraîchir la modale
    showPropalDetails({ preventDefault: () => { }, target: { closest: () => window.currentPropalRow } });
}

function removePropalTarif(tarifId) {
    delete window.currentPropalDetails[tarifId];

    // Rafraîchir la modale
    showPropalDetails({ preventDefault: () => { }, target: { closest: () => window.currentPropalRow } });
}
