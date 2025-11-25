const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

const app = express();
const PORT = 3000;

// Initialize Firebase Admin SDK
// Download your service account key from Firebase Console and save as firebase-admin-sdk.json
const serviceAccount = require("./firebase-admin-sdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const userProfilesPath = path.join(__dirname, 'public/user-profiles');

// Create user-profiles directory if it doesn't exist
if (!fs.existsSync(userProfilesPath)) {
    fs.mkdirSync(userProfilesPath, { recursive: true });
}

// Helper function to read user profile data
const readUserProfile = (userId) => {
    const filePath = path.join(userProfilesPath, `${userId}.json`);
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    return null;
};

// Helper function to write user profile data
const writeUserProfile = (userId, data) => {
    const filePath = path.join(userProfilesPath, `${userId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Middleware
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.userId = decodedToken.uid;
        req.userEmail = decodedToken.email;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
    }
};

// Multer configuration
const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, cb){
       cb(null, `avatar-${req.userId}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
}).single("avatar");

// ========== PROFILE ROUTES (Protected by Firebase Auth) ==========

// Initialize user profile (called after Firebase signup/signin)
app.post('/api/profile/initialize', verifyFirebaseToken, async (req, res) => {
    try {
        const { name, email, avatar } = req.body;
        
        let userProfile = readUserProfile(req.userId);
        
        if (!userProfile) {
            // Create new profile
            userProfile = {
                uid: req.userId,
                name: name || 'User',
                email: email || req.userEmail,
                bio: '',
                avatarUrl: avatar || '/uploads/default-avatar.png',
                createdAt: new Date().toISOString()
            };
            writeUserProfile(req.userId, userProfile);
        }
        
        res.json({ success: true, message: 'Profile initialized', profile: userProfile });
    } catch (error) {
        console.error('Initialize profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Upload avatar
app.post('/api/profile/avatar', verifyFirebaseToken, (req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.status(400).json({ success: false, message: 'Image upload failed.', error: err });
        } else {
            if(req.file == undefined){
                res.status(400).json({ success: false, message: 'No file selected!' });
            } else {
                let userProfile = readUserProfile(req.userId);
                if (!userProfile) {
                    userProfile = {
                        uid: req.userId,
                        name: 'User',
                        email: req.userEmail,
                        bio: '',
                        avatarUrl: '',
                        createdAt: new Date().toISOString()
                    };
                }
                
                userProfile.avatarUrl = '/uploads/' + req.file.filename;
                writeUserProfile(req.userId, userProfile);
                
                res.json({ 
                    success: true, 
                    message: 'Avatar updated successfully!', 
                    filePath: userProfile.avatarUrl 
                });
            }
        }
    });
});

// Update profile
app.post("/api/profile", verifyFirebaseToken, (req, res) => {
    try {
        const { name, email, bio } = req.body;
        
        let userProfile = readUserProfile(req.userId);
        
        if (!userProfile) {
            userProfile = {
                uid: req.userId,
                name: '',
                email: req.userEmail,
                bio: '',
                avatarUrl: '/uploads/default-avatar.png',
                createdAt: new Date().toISOString()
            };
        }
        
        userProfile.name = name;
        userProfile.email = email;
        userProfile.bio = bio;
        userProfile.updatedAt = new Date().toISOString();
        
        writeUserProfile(req.userId, userProfile);
        
        res.json({ success: true, message: "Profile updated successfully!" });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get profile
app.get("/api/profile", verifyFirebaseToken, (req, res) => {
    try {
        let userProfile = readUserProfile(req.userId);
        
        if (!userProfile) {
            // Create default profile if doesn't exist
            userProfile = {
                uid: req.userId,
                name: 'User',
                email: req.userEmail,
                bio: '',
                avatarUrl: '/uploads/default-avatar.png',
                createdAt: new Date().toISOString()
            };
            writeUserProfile(req.userId, userProfile);
        }
        
        res.json(userProfile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Check authentication status
app.get('/api/check-auth', verifyFirebaseToken, (req, res) => {
    res.json({ 
        authenticated: true, 
        userId: req.userId,
        email: req.userEmail 
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));