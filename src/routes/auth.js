const { Router } = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const router = Router();

// Load OAuth2 credentials
const oauth2Config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../Oauth2.json'), 'utf8'));
const { client_id, client_secret, redirect_uris } = oauth2Config.web;

// Function to initialize user directories
const initializeUserDirectories = (username) => {
    const datasDir = path.join(__dirname, '../../datas');
    const userDir = path.join(datasDir, username);
    const devisDir = path.join(userDir, 'Devis');
    const facturesDir = path.join(userDir, 'Factures');

    try {
        // Create main user directory
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
            console.log(`Created user directory: ${userDir}`);
        }

        // Create Devis subdirectory
        if (!fs.existsSync(devisDir)) {
            fs.mkdirSync(devisDir, { recursive: true });
            console.log(`Created Devis directory: ${devisDir}`);
        }

        // Create Factures subdirectory
        if (!fs.existsSync(facturesDir)) {
            fs.mkdirSync(facturesDir, { recursive: true });
            console.log(`Created Factures directory: ${facturesDir}`);
        }

        return userDir;
    } catch (error) {
        console.error('Error initializing user directories:', error);
        throw error;
    }
};

// Determine redirect URI based on environment
const getRedirectUri = (req) => {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    
    // If in development (localhost), use local callback
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        return `${protocol}://${host}/api/auth/google/callback`;
    }
    
    // Otherwise use the configured production URI
    return redirect_uris[0];
};

// Generate authentication URL
router.get('/google', (req, res) => {
    const redirectUri = getRedirectUri(req);
    const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirectUri
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/calendar'
        ],
    });
    res.json({ authUrl });
});

// Handle Google callback
router.get('/google/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.status(400).json({ error: 'No authorization code provided' });
    }

    try {
        const redirectUri = getRedirectUri(req);
        const oauth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirectUri
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        // Extract username from email (before @)
        const username = userInfo.data.email.split('@')[0];

        // Initialize user directories
        initializeUserDirectories(username);

        // Store tokens and user info in session
        req.session.tokens = tokens;
        req.session.user = {
            id: userInfo.data.id,
            username: username,
            name: userInfo.data.name,
            email: userInfo.data.email,
            picture: userInfo.data.picture
        };

        // Close the popup window and update parent
        res.send(`
            <html>
                <body>
                    <script>
                        window.opener.location.reload();
                        window.close();
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.send(`
            <html>
                <body>
                    <script>
                        alert('Authentication failed: ' + '${error.message}');
                        window.close();
                    </script>
                </body>
            </html>
        `);
    }
});

// Get current user info
router.get('/user', (req, res) => {
    if (req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ success: true });
    });
});

module.exports = router;
