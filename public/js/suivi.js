// Suivi / Propals logic

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

        row.addEventListener('dblclick', function () { editPropalRow(this, item.id); });

        row.innerHTML = `
            <td class="id">${item.id}</td>
            <td class="devis_number">${item.devis_number || ''}</td>
            <td>${date}</td>
            <td>${displayDuree}</td>
            <td class="id_client">${item.client_name || item.id_client || ''}</td>
            <td class="id_tarifs">[...]</td>
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

    row.innerHTML = `
        <td style="display:none;"><input type="text" name="id" class="form-input" disabled></td>
        <td><input type="text" name="devis_number" class="form-input" placeholder="#" disabled></td>
        <td><input type="datetime-local" name="date_heure" class="form-input" value="${formattedDefaultDate}" required></td>
        <td><input type="text" name="duree" class="form-input" placeholder="HH:MM" disabled></td>
        <td>
            <select name="id_client" class="form-input" required onchange="updatePropalDefaults(this)">
                <option value="">Sélectionner un client</option>
                ${window.availableClients ? window.availableClients.map(c => `<option value="${c.id}" ${c.id == preselectedClientId ? 'selected' : ''}>${c.nom} ${c.prenom}</option>`).join('') : ''}
            </select>
        </td>
        <td><button class="btn-icon" onclick="showPropalDetails(event)">📋</button></td>
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

        row.dataset.id = id;
        row.innerHTML = `
            <td class="id">${data.id}</td>
            <td class="devis_number">${data.devis_number || ''}</td>
             <td><input type="datetime-local" name="date_heure" class="form-input" value="${data.date_heure}" required></td>
            <td><input type="text" name="duree" class="form-input" value="${data.duree || ''}" disabled></td>
            <td>
                <select name="id_client" class="form-input" required onchange="updatePropalDefaults(this)">
                    <option value="">Sélectionner un client</option>
                    ${window.availableClients ? window.availableClients.map(c => `<option value="${c.id}" ${c.id == data.id_client || c.nom === data.client_name ? 'selected' : ''}>${c.nom} ${c.prenom}</option>`).join('') : ''}
                </select>
            </td>
            <td><button class="btn-icon" onclick="showPropalDetails(event)">📋</button></td>
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
                detail: ""
            };
            updatePropalCalculations(row);
        }
    }
}

function showPropalDetails(event) {
    event.preventDefault();
    const row = event.target.closest('tr');
    window.currentPropalRow = row;

    // Show modal for tarif selection
    const modal = document.getElementById('invoiceItemsModal');
    if (!modal) {
        alert("Modal not found");
        return;
    }

    // Populate modal with available tarifs and current selections
    let html = '<div class="modal-content"><h3>Détails de la Propal</h3>';
    html += '<table style="width:100%"><thead><tr><th>Tarif</th><th>Qté</th><th>P.U.</th><th>Total</th></tr></thead><tbody>';

    window.availableTarifs.forEach(tarif => {
        const qtt = window.currentPropalDetails[tarif.id]?.qtt || 0;
        const prix = parseFloat(tarif.prix) || 0;
        const total = (qtt * prix).toFixed(2);
        html += `
            <tr>
                <td>${tarif.libelle}</td>
                <td><input type="number" class="tarif-qtt" data-tarif-id="${tarif.id}" value="${qtt}" min="0" step="0.01" onchange="updatePropalDetails(this)"></td>
                <td>${prix.toFixed(2)}</td>
                <td>${total}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    html += '<div class="modal-actions" style="margin-top:15px;">';
    html += '<button class="btn btn-success" onclick="closeInvoiceItemsModal(); updatePropalCalculations(window.currentPropalRow)">Valider</button>';
    html += '<button class="btn btn-secondary" onclick="closeInvoiceItemsModal()">Annuler</button>';
    html += '</div></div>';

    modal.innerHTML = html;
    modal.classList.remove('hidden');
}

function updatePropalDetails(input) {
    const tarifId = input.dataset.tarifId;
    const qtt = parseFloat(input.value) || 0;

    if (qtt > 0) {
        window.currentPropalDetails[tarifId] = {
            qtt: qtt,
            detail: ""
        };
    } else {
        delete window.currentPropalDetails[tarifId];
    }
}

function updatePropalCalculations(row) {
    if (!row) return;

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
    row.querySelector('input[name="duree"]').value = dureeStr;
    row.querySelector('input[name="montant"]').value = totalMontant.toFixed(2);
    row.dataset.tarifDetails = JSON.stringify(idTarifs);
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
