const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const calculateTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

/**
 * Generates a shorter, URL-friendly unique ID.
 * @param {number} length The desired length of the ID. Defaults to 18.
 * @returns {string} A unique ID string.
 */
const generateUniqueId = (length = 18) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
    // Use crypto for a more secure random byte generation
    return Array.from(crypto.randomBytes(length)).map(byte => characters[byte % characters.length]).join('');
};

// TSV utilities
const parseTSV = (filePath) => {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    // Utilise une expression régulière pour gérer les sauts de ligne Windows (CRLF) et Linux/Unix (LF).
    const lines = content.trim().split(/\r?\n/);
    
    if (lines.length === 0) return [];
    
    const headers = lines[0].split('\t');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const obj = {};
        
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        
        data.push(obj);
    }
    
    return data;
};

const writeTSV = (filePath, data) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    let content = headers.join('\t') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => (row[header] || '').toString());
        content += values.join('\t') + '\n';
    });
    
    fs.writeFileSync(filePath, content, 'utf-8');
};

const findInTSV = (filePath, field, value) => {
    const data = parseTSV(filePath);
    return data.find(item => item[field] === value.toString()) || null;
};

const getTSVFilePath = (type, username = null) => {
    const basePath = path.join(process.cwd(), 'datas');
    const fileMap = {
        'clients': 'clients.tsv',
        'tarifs': 'tarifs.tsv',
        'suivi': 'suiviActivite.tsv'
    };
    
    // If username is provided, use user-specific directory
    if (username) {
        return path.join(basePath, username, fileMap[type] || `${type}.tsv`);
    }
    
    // Otherwise use default datas directory (for non-authenticated or demo mode)
    return path.join(basePath, fileMap[type] || `${type}.tsv`);
};

const getSettingsPath = (username = null) => {
    const basePath = path.join(process.cwd(), 'datas');
    
    if (username) {
        return path.join(basePath, username, 'settings.json');
    }
    
    return path.join(basePath, 'settings.json');
};

const getDevisPath = (username = null, devisId = null) => {
    const basePath = path.join(process.cwd(), 'datas');
    
    if (!username) {
        return path.join(basePath, 'Devis');
    }
    
    const devisDir = path.join(basePath, username, 'Devis');
    if (devisId) {
        return path.join(devisDir, `${devisId}.json`);
    }
    
    return devisDir;
};

const getFacturesPath = (username = null, factureId = null) => {
    const basePath = path.join(process.cwd(), 'datas');
    
    if (!username) {
        return path.join(basePath, 'Factures');
    }
    
    const facturesDir = path.join(basePath, username, 'Factures');
    if (factureId) {
        return path.join(facturesDir, `${factureId}.json`);
    }
    
    return facturesDir;
};

module.exports = {
    formatDate,
    calculateTotal,
    generateUniqueId,
    parseTSV,
    writeTSV,
    findInTSV,
    getTSVFilePath,
    getSettingsPath,
    getDevisPath,
    getFacturesPath
};
