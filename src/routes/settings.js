const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const { getSettingsPath } = require('../utils');

const router = Router();

// Get info (nom, version, etc)
const getInfo = async (req, res) => {
    try {
        const packageJson = require('../../package.json');
        res.json({
             author:packageJson.author,
             version:packageJson.version,
             license:packageJson.license,
             name:packageJson.name,
             description:packageJson.description,
             "username": req.username
        });
    } catch (error) {
        res.status(500).json({ message: 'Error loading info', error });
    }
};

// Get settings
const getSettings = async (req, res) => {
    try {
        const settingsPath = getSettingsPath(req.username);
        
        // Default settings
        const defaultSettings = {
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

        // Try to load user-specific or demo settings file
        if (fs.existsSync(settingsPath)) {
            try {
                const fileContent = fs.readFileSync(settingsPath, 'utf-8');
                const userSettings = JSON.parse(fileContent);
                res.json({ ...defaultSettings, ...userSettings });
                return;
            } catch (err) {
                console.error('Error parsing settings file:', err);
            }
        }

        res.json(defaultSettings);
    } catch (error) {
        res.status(500).json({ message: 'Error loading settings', error });
    }
};

// Save settings
const saveSettings = async (req, res) => {
    try {
        const settingsPath = getSettingsPath(req.username);
        const settingsDir = path.dirname(settingsPath);

        // Create directory if it doesn't exist
        if (!fs.existsSync(settingsDir)) {
            fs.mkdirSync(settingsDir, { recursive: true });
        }

        // Save settings to file
        fs.writeFileSync(settingsPath, JSON.stringify(req.body, null, 2), 'utf-8');
        
        res.json({ message: 'Settings saved successfully', data: req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error saving settings', error });
    }
};

router.get('/info', getInfo);
router.get('/settings', getSettings);
router.post('/settings', saveSettings);

module.exports = router;
