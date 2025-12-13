const { Router } = require('express');
const tarifController = require('../controllers/tarifs');

const router = Router();

// Route to get all tarifs
router.get('/', tarifController.getTarifs);

// Route to get a single tarif by ID
router.get('/:id', tarifController.getTarifById);

// Route to create a new tarif
router.post('/', tarifController.createTarif);

// Route to update an existing tarif
router.put('/:id', tarifController.updateTarif);

// Route to delete a tarif
router.delete('/:id', tarifController.deleteTarif);

module.exports = router;
