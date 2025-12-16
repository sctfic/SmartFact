const { parseTSV, writeTSV, generateUniqueId, getTSVFilePath } = require('../utils');

// Get all suivi
const getSuivi = async (req, res) => {
    try {

        const filePath = getTSVFilePath('suivi', req.username);
        const suivis = parseTSV(filePath);
        // console.log(filePath, suivis);

        // Join with client names
        const clientPath = getTSVFilePath('clients', req.username);
        const clients = parseTSV(clientPath);

        const enrichedSuivis = suivis.map(s => {
            console.log(s);
            const client = clients.find(c => c.id === s.id_client);
            console.log(client);
            return {
                ...s,
                client_name: client ? `${client.prenom} ${client.nom}` : s.id_client,
                tarifs: s.id_tarifs.startsWith('{"') ? JSON.parse(s.id_tarifs) : {},
            };
        });
        console.log(enrichedSuivis);
        res.status(200).json(enrichedSuivis);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving suivi', error });
    }
};

// Get a single suivi by ID
const getSuiviById = async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = getTSVFilePath('suivi', req.username);
        const suivis = parseTSV(filePath);
        const suivi = suivis.find(s => s.id === id);

        if (!suivi) {
            return res.status(404).json({ message: 'Suivi not found' });
        }
        res.status(200).json(suivi);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving suivi', error });
    }
};

// Create a new suivi
const createSuivi = async (req, res) => {
    try {
        const filePath = getTSVFilePath('suivi', req.username);
        const suivis = parseTSV(filePath);

        // Generate devis_number (max existing + 1)
        const maxNumber = suivis.reduce((max, s) => {
            const num = parseInt(s.devis_number) || 0;
            return num > max ? num : max;
        }, 0);
        const devis_number = String(maxNumber + 1).padStart(4, '0');

        const newSuivi = {
            id: generateUniqueId(),
            devis_number,
            statut: 'draft',
            ...req.body,
            dateCreation: new Date().toISOString()
        };

        // Stringify id_tarifs si c'est un objet
        if (newSuivi.id_tarifs && typeof newSuivi.id_tarifs === 'object') {
            newSuivi.id_tarifs = JSON.stringify(newSuivi.id_tarifs);
        }

        suivis.push(newSuivi);
        writeTSV(filePath, suivis);

        res.status(201).json(newSuivi);
    } catch (error) {
        res.status(400).json({ message: 'Error creating suivi', error });
    }
};

// Update an existing suivi
const updateSuivi = async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = getTSVFilePath('suivi', req.username);
        const suivis = parseTSV(filePath);

        const suiviIndex = suivis.findIndex(s => s.id === id);
        if (suiviIndex === -1) {
            return res.status(404).json({ message: 'Suivi not found' });
        }

        const updatedSuivi = {
            ...suivis[suiviIndex],
            ...req.body
        };

        // Stringify id_tarifs si c'est un objet
        if (updatedSuivi.id_tarifs && typeof updatedSuivi.id_tarifs === 'object') {
            updatedSuivi.id_tarifs = JSON.stringify(updatedSuivi.id_tarifs);
        }

        suivis[suiviIndex] = updatedSuivi;
        writeTSV(filePath, suivis);

        res.status(200).json(updatedSuivi);
    } catch (error) {
        res.status(400).json({ message: 'Error updating suivi', error });
    }
};

// Delete a suivi
const deleteSuivi = async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = getTSVFilePath('suivi', req.username);
        const suivis = parseTSV(filePath);

        const suiviIndex = suivis.findIndex(s => s.id === id);
        if (suiviIndex === -1) {
            return res.status(404).json({ message: 'Suivi not found' });
        }

        suivis.splice(suiviIndex, 1);
        writeTSV(filePath, suivis);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting suivi', error });
    }
};

module.exports = {
    getSuivi,
    getSuiviById,
    createSuivi,
    updateSuivi,
    deleteSuivi
};
