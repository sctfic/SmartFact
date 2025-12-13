const { Router } = require('express');
const suiviController = require('../controllers/suivi');

const router = Router();

// Route to get all suivi
router.get('/', suiviController.getSuivi);

// Route to get a single suivi by ID
router.get('/:id', suiviController.getSuiviById);

// Route to create a new suivi
router.post('/', suiviController.createSuivi);

// Route to update an existing suivi
router.put('/:id', suiviController.updateSuivi);

// Route to delete a suivi
router.delete('/:id', suiviController.deleteSuivi);

module.exports = router;
