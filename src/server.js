const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { json, urlencoded } = require('body-parser');
const listEndpoints = require('express-list-endpoints');
const path = require('path');

// Route imports
const clientRoutes = require('./routes/clients');
const tarifRoutes = require('./routes/tarifs');
const suiviRoutes = require('./routes/suivi');
const appRoutes = require('./routes/app');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({ 
    secret: 'your_secret_key', 
    resave: false, 
    saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/tarifs', tarifRoutes);
app.use('/api/suivi', suiviRoutes);
app.use('/api', appRoutes); // Ce routeur gère maintenant /info et /settings

// Route pour lister dynamiquement les points d'accès de l'API
app.get('/api', (req, res) => {
    const endpoints = listEndpoints(app);
    
    // Transforme le tableau en un objet où les chemins sont les clés.
    const formattedEndpoints = endpoints.reduce((acc, { path, methods }) => {
        acc[path] = methods;
        return acc;
    }, {});

    res.json(formattedEndpoints);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
