const { parseTSV, writeTSV, generateUniqueId, getTSVFilePath } = require('../utils');

// Get all clients
const getClients = async (req, res) => {
    try {
        const filePath = getTSVFilePath('clients');
        const clients = parseTSV(filePath);
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving clients', error });
    }
};

// Get a single client by ID
const getClientById = async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = getTSVFilePath('clients');
        const clients = parseTSV(filePath);
        const client = clients.find(c => c.id === id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving client', error });
    }
};

// Create a new client
const createClient = async (req, res) => {
    try {
        const filePath = getTSVFilePath('clients');
        const clients = parseTSV(filePath);

        const newClient = {
            id: generateUniqueId(),
            ...req.body,
            dateCreation: new Date().toISOString(),
            lastDate: new Date().toISOString()
        };

        clients.push(newClient);
        writeTSV(filePath, clients);

        res.status(201).json(Client);
    } catch (error) {
        res.status(400).json({ message: 'Error creating client', error });
    }
};

// Update an existing client
const updateClient = async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = getTSVFilePath('clients');
        const clients = parseTSV(filePath);

        const clientIndex = clients.findIndex(c => c.id === id);
        if (clientIndex === -1) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const updatedClient = {
            ...clients[clientIndex],
            ...req.body,
            lastDate: new Date().toISOString()
        };

        clients[clientIndex] = updatedClient;
        writeTSV(filePath, clients);

        res.status(200).json(updatedClient);
    } catch (error) {
        res.status(400).json({ message: 'Error updating client', error });
    }
};

// Delete a client
const deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = getTSVFilePath('clients');
        const clients = parseTSV(filePath);

        const clientIndex = clients.findIndex(c => c.id === id);
        if (clientIndex === -1) {
            return res.status(404).json({ message: 'Client not found' });
        }

        clients.splice(clientIndex, 1);
        writeTSV(filePath, clients);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting client', error });
    }
};

module.exports = {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
};
