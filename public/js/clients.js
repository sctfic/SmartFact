// Clients logic

// Load clients data
async function loadClientsData() {
    console.log('loadClientsData');
    try {
        const [clientsData, tarifsData] = await Promise.all([
            fetch('/api/clients').then(r => r.json()),
            fetch('/api/tarifs').then(r => r.json())
        ]);
        window.clientData = clientsData;
        window.availableClients = clientsData;
        window.availableTarifs = tarifsData;

        // Apply filters (includes sorting and population)
        if (window.applyClientFilters) window.applyClientFilters();
        else populateClientsTable(clientsData);

        populateTarifsSelect();
    } catch (error) {
        console.error('Error loading clients data:', error);
    }
}

// Populate clients table
function populateClientsTable(data) {
    console.log('populateClientsTable');
    const tbody = document.querySelector('#clientsTable tbody');
    if (!tbody) return;

    // Create context menu if it doesn't exist
    if (!document.getElementById('clientContextMenu')) {
        const menu = document.createElement('div');
        menu.id = 'clientContextMenu';
        menu.className = 'context-menu hidden';
        menu.style.position = 'fixed'; // Fixed to viewport
        menu.style.zIndex = '10000';
        menu.style.background = '#fff';
        menu.style.border = '1px solid #ccc';
        menu.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)';
        menu.style.padding = '5px 0';
        menu.style.borderRadius = '4px';

        const item = document.createElement('div');
        item.innerText = 'Faire une propal';
        item.style.padding = '8px 12px';
        item.style.cursor = 'pointer';
        item.style.fontSize = '14px';
        item.onmouseover = () => item.style.backgroundColor = '#f0f0f0';
        item.onmouseout = () => item.style.backgroundColor = 'transparent';

        item.onclick = () => {
            const clientId = menu.dataset.clientId;
            if (clientId) {
                // Currently defined in suivi.js or global, but it manages propals
                if (typeof createPropalForClient === 'function') {
                    createPropalForClient(clientId);
                } else {
                    console.error('createPropalForClient function not found');
                }
            }
            menu.classList.add('hidden');
        };

        menu.appendChild(item);
        document.body.appendChild(menu);

        // Global click to close menu
        document.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    }

    const menu = document.getElementById('clientContextMenu');

    tbody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        row.addEventListener('dblclick', function () { editClientRow(this, item.id); });

        // Right click handler
        row.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            menu.dataset.clientId = item.id;
            menu.style.top = `${e.clientY}px`;
            menu.style.left = `${e.clientX}px`;
            menu.classList.remove('hidden');
        });

        row.innerHTML = `
            <td class="id" style="display:none;">${item.id}</td>
            <td>${item.nom || ""}</td>
            <td>${item.prenom || ""}</td>
            <td>${item.telephone || ""}</td>
            <td>${item.email || ""}</td>
            <td>${item.adresse || ""}</td>
            <td>${item.ville || ""}</td>
            <td>${item.distance || ""}</td>
            <td>${item.notes || ""}</td>
            <td><input type="checkbox" ${item.statut === "actif" ? "checked" : ""} disabled></td>
            <td>${item.dateCreation ? new Date(item.dateCreation).toLocaleDateString("fr-FR") : ""}</td>
            <td class="actions-cell">
                <button class="btn-icon" title="Supprimer" onclick="deleteClient('${item.id}')">
                    <svg viewBox="0 0 18 18"><path d="M6.5 3c0-.552.444-1 1-1h3c.552 0 1 .444 1 1H15v2H3V3h3.5zM4 6h10v8c0 1.105-.887 2-2 2H6c-1.105 0-2-.887-2-2V6z" fill-rule="evenodd"></path></svg>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Inline editing for Clients
function addClientRow() {
    console.log('addClientRow');
    // Save/Close existing edit first
    if (window.currentEditingRow) {
        const table = window.currentEditingRow.closest('table');
        if (table) {
            if (table.id === 'tarifsTable') saveTarifRow(window.currentEditingRow);
            else if (table.id === 'clientsTable') saveClientRow(window.currentEditingRow);
            else if (table.id === 'PropalsTable') savePropalRow(window.currentEditingRow);
        }
    }

    const tbody = document.querySelector('#clientsTable tbody');
    const row = document.createElement('tr');
    row.classList.add('editing-row');
    row.innerHTML = `
        <td style="display:none;"><input type="text" name="id" class="form-input" disabled></td>
        <td><input type="text" name="nom" class="form-input" placeholder="Nom" required></td>
        <td><input type="text" name="prenom" class="form-input" placeholder="Prénom" required></td>
        <td><input type="tel" name="telephone" class="form-input" placeholder="Téléphone" pattern="[0-9]{10}"></td>
        <td><input type="email" name="email" class="form-input" placeholder="Email"></td>
        <td><input type="text" name="adresse" class="form-input" placeholder="Adresse"></td>
        <td><input type="text" name="ville" class="form-input" placeholder="Ville"></td>
        <td><input type="number" name="distance" class="form-input" step="any" placeholder="Distance (km)"></td>
        <td><input type="text" name="notes" class="form-input" placeholder="Notes"></td>
        <td><input type="checkbox" name="statut" class="form-input" checked></td>
        <td>-</td>
        <td class="actions-cell">
            <button class="btn-icon" title="Sauvegarder" onclick="saveClientRow(this.closest('tr'))">
               <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </button>
            <button class="btn-icon" title="Annuler" onclick="loadClientsData()">
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
        </td>
    `;
    tbody.prepend(row);
    window.currentEditingRow = row;
    row.querySelector('input[name="nom"]').focus();
}

function editClientRow(row, id) {
    console.log('editClientRow', id);
    enterEditMode(row, () => {
        const data = window.clientData.find(c => c.id == id); // Loose equality for string/int match
        if (!data) return;

        row.dataset.id = id;
        row.classList.add('editing-row');
        row.innerHTML = `
            <td style="display:none;"><input type="text" name="id" class="form-input" value="${data.id}" disabled></td>
            <td><input type="text" name="nom" class="form-input" value="${data.nom || ''}" required></td>
            <td><input type="text" name="prenom" class="form-input" value="${data.prenom || ''}" required></td>
            <td><input type="tel" name="telephone" class="form-input" value="${data.telephone || ''}"></td>
            <td><input type="email" name="email" class="form-input" value="${data.email || ''}"></td>
            <td><input type="text" name="adresse" class="form-input" value="${data.adresse || ''}"></td>
            <td><input type="text" name="ville" class="form-input" value="${data.ville || ''}"></td>
            <td><input type="number" name="distance" class="form-input" step="any" value="${data.distance || ''}"></td>
            <td><input type="text" name="notes" class="form-input" value="${data.notes || ''}"></td>
            <td><input type="checkbox" name="statut" class="form-input" ${data.statut === 'actif' ? 'checked' : ''}></td>
            <td>${data.dateCreation ? new Date(data.dateCreation).toLocaleDateString("fr-FR") : ""}</td>
            <td class="actions-cell">
                <button class="btn-icon" title="Sauvegarder" onclick="saveClientRow(this.closest('tr'))">
                   <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </button>
                <button class="btn-icon" title="Annuler" onclick="loadClientsData()">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
            </td>
        `;
        // row.querySelector('input[name="nom"]').focus(); // Optional
    });
}

async function saveClientRow(row) {
    console.log('saveClientRow');
    const id = row.dataset.id;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/clients/${id}` : '/api/clients';

    const payload = {};
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        // Skip the id field for new clients (POST), it will be generated by the server
        if (!id && input.name === 'id') return;
        
        if (input.type === 'checkbox') {
            payload[input.name] = input.checked ? 'actif' : 'inactif';
        } else if (input.name) {
            payload[input.name] = input.value;
        }
    });

    if (!payload.nom || !payload.prenom) {
        alert("Nom et Prénom sont obligatoires.");
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
            loadClientsData(); // Refresh table
        } else {
            const err = await response.json();
            alert("Erreur: " + (err.message || "Erreur inconnue"));
        }
    } catch (e) {
        console.error(e);
        alert("Erreur de connexion.");
    }
}

async function deleteClient(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;
    try {
        const response = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadClientsData();
        } else {
            alert('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

window.applyClientFilters = () => {
    if (!window.clientData) return;

    let filtered = window.clientData.filter(item => {
        // Column filters
        const colFilters = window.tableState.clients.colFilters;
        for (const [col, val] of Object.entries(colFilters)) {
            if (!val) continue;
            let itemVal = (item[col] || '').toString().toLowerCase();
            if (!itemVal.includes(val)) return false;
        }
        return true;
    });

    // Sorting
    const { sortCol, sortDesc } = window.tableState.clients;
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
    populateClientsTable(filtered);
};
