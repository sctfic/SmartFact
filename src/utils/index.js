const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const calculateTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const generateUniqueId = () => {
    return uuidv4();
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

const getTSVFilePath = (type) => {
    const basePath = path.join(process.cwd(), 'datas');
    const fileMap = {
        'clients': 'clients.tsv',
        'tarifs': 'tarifs.tsv',
        'suivi': 'suiviActivite.tsv'
    };
    
    return path.join(basePath, fileMap[type] || `${type}.tsv`);
};

module.exports = {
    formatDate,
    calculateTotal,
    generateUniqueId,
    parseTSV,
    writeTSV,
    findInTSV,
    getTSVFilePath
};
