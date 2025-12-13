const { Router } = require('express');
const clientController = require('../controllers/clients');

const router = Router();

// Route to get all clients
router.get('/', clientController.getClients);

// Route to get a single client by ID
router.get('/:id', clientController.getClientById);

// Route to create a new client
router.post('/', clientController.createClient);

// Route to update an existing client
router.put('/:id', clientController.updateClient);

// Route to delete a client
router.delete('/:id', clientController.deleteClient);

module.exports = router;
