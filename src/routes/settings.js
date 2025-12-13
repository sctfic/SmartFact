const { Router } = require('express');
const { parseTSV, writeTSV, getTSVFilePath } = require('../utils');

const router = Router();

// Get info (nom, version, etc)
const getInfo = async (req, res) => {
    try {
        const packageJson = require('../../package.json');
        res.json({
            name: 'SmartFact',
            version: packageJson.version || '1.0.0',
            description: packageJson.description || 'Application de gestion des devis et factures'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error loading info', error });
    }
};

// Get settings
const getSettings = async (req, res) => {
    try {
        // Try to load settings from a config file or return defaults
        const settings = {
            managerName: 'Gestionnaire',
            managerTitle: 'Profession',
            managerPhone: '',
            managerEmail: '',
            managerAddress: '',
            managerCity: '',
            tva: 20,
            siret: '',
            ape: '',
            adeli: '',
            iban: '',
            bic: '',
            tvaMention: '',
            paymentTerms: '',
            insurance: ''
        };
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error loading settings', error });
    }
};

// Save settings
const saveSettings = async (req, res) => {
    try {
        // Here you would save settings to a file or database
        res.json({ message: 'Settings saved successfully', data: req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error saving settings', error });
    }
};

router.get('/info', getInfo);
router.get('/settings', getSettings);
router.post('/settings', saveSettings);

module.exports = router;
