const { parseTSV, writeTSV, generateUniqueId, getTSVFilePath } = require('../utils');

// Get all tarifs
const getTarifs = async (req, res) => {
    try {
        const filePath = getTSVFilePath('tarifs');
        const tarifs = parseTSV(filePath);
        res.status(200).json(tarifs);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving tarifs', error });
    }
};

// Get a single tarif by ID
const getTarifById = async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = getTSVFilePath('tarifs');
        const tarifs = parseTSV(filePath);
        const tarif = tarifs.find(t => t.id === id);

        if (!tarif) {
            return res.status(404).json({ message: 'Tarif not found' });
        }
        res.status(200).json(tarif);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving tarif', error });
    }
};

// Create a new tarif
const createTarif = async (req, res) => {
    try {
        const filePath = getTSVFilePath('tarifs');
        const tarifs = parseTSV(filePath);

        const newTarif = {
            id: generateUniqueId(),
            ...req.body
        };

        tarifs.push(newTarif);
        writeTSV(filePath, tarifs);

        res.status(201).json(tarif);
    } catch (error) {
        res.status(400).json({ message: 'Error creating tarif', error });
    }
};

// Update an existing tarif
const updateTarif = async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = getTSVFilePath('tarifs');
        const tarifs = parseTSV(filePath);

        const tarifIndex = tarifs.findIndex(t => t.id === id);
        if (tarifIndex === -1) {
            return res.status(404).json({ message: 'Tarif not found' });
        }

        const updatedTarif = {
            ...tarifs[tarifIndex],
            ...req.body
        };

        tarifs[tarifIndex] = updatedTarif;
        writeTSV(filePath, tarifs);

        res.status(200).json(updatedTarif);
    } catch (error) {
        res.status(400).json({ message: 'Error updating tarif', error });
    }
};

// Delete a tarif
const deleteTarif = async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = getTSVFilePath('tarifs');
        const tarifs = parseTSV(filePath);

        const tarifIndex = tarifs.findIndex(t => t.id === id);
        if (tarifIndex === -1) {
            return res.status(404).json({ message: 'Tarif not found' });
        }

        tarifs.splice(tarifIndex, 1);
        writeTSV(filePath, tarifs);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting tarif', error });
    }
};

module.exports = {
    getTarifs,
    getTarifById,
    createTarif,
    updateTarif,
    deleteTarif
};
