const { parseTSV, writeTSV, generateUniqueId, getTSVFilePath } = require('../utils');

// Get all suivi
const getSuivi = async (req, res) => {
    try {
        const filePath = getTSVFilePath('suivi');
        const suivis = parseTSV(filePath);
        
        // Join with client names
        const clientPath = getTSVFilePath('clients');
        const clients = parseTSV(clientPath);
        
        const enrichedSuivis = suivis.map(s => {
            const client = clients.find(c => c.id === s.id_client);
            return {
                ...s,
                client_name: client ? `${client.prenom} ${client.nom}` : s.id_client
            };
        });
        
        res.status(200).json(enrichedSuivis);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving suivi', error });
    }
};

// Get a single suivi by ID
const getSuiviById = async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = getTSVFilePath('suivi');
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
        const filePath = getTSVFilePath('suivi');
        const suivis = parseTSV(filePath);
        
        const newSuivi = {
            id: generateUniqueId(),
            ...req.body,
            dateCreation: new Date().toISOString()
        };
        
        suivis.push(newSuivi);
        writeTSV(filePath, suivis);
        
        res.status(201).json(suivis);
    } catch (error) {
        res.status(400).json({ message: 'Error creating suivi', error });
    }
};

// Update an existing suivi
const updateSuivi = async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = getTSVFilePath('suivi');
        const suivis = parseTSV(filePath);
        
        const suiviIndex = suivis.findIndex(s => s.id === id);
        if (suiviIndex === -1) {
            return res.status(404).json({ message: 'Suivi not found' });
        }
        
        const updatedSuivi = {
            ...suivis[suiviIndex],
            ...req.body
        };
        
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
        const filePath = getTSVFilePath('suivi');
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
