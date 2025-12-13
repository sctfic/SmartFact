const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const settingsFilePath = path.join(process.cwd(), 'configs', 'settings.json');
const packageFilePath = path.join(process.cwd(), 'package.json');

/**
 * @route GET /api/info
 * @description Renvoie les informations de base de l'application depuis package.json.
 */
router.get('/info', (req, res) => {
    try {
        const packageFile = fs.readFileSync(packageFilePath, 'utf-8');
        const { author, version, license, name, description } = JSON.parse(packageFile);
        res.json({ author, version, license, name, description });
    } catch (error) {
        console.error('Error reading package.json:', error);
        res.status(500).json({ message: "Impossible de récupérer les informations de l'application." });
    }
});

/**
 * @route GET /api/settings
 * @description Renvoie la configuration actuelle depuis settings.json.
 */
router.get('/settings', (req, res) => {
    try {
        const settingsFile = fs.readFileSync(settingsFilePath, 'utf-8');
        res.json(JSON.parse(settingsFile));
    } catch (error) {
        console.error('Error reading settings.json:', error);
        res.status(500).json({ message: "Impossible de récupérer la configuration." });
    }
});

/**
 * @route POST /api/settings
 * @description Met à jour et sauvegarde la configuration dans settings.json.
 */
router.post('/settings', (req, res) => {
    const newSettings = req.body;
    fs.writeFileSync(settingsFilePath, JSON.stringify(newSettings, null, 2), 'utf-8');
    res.json({ message: 'Configuration enregistrée avec succès.', settings: newSettings });
});

module.exports = router;