const User = require('../models/User');

const refreshTokens = require('../models/RefreshToken');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
            name, 
        });

        await user.save();

        res.status(201).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if( !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        await refreshTokens.create({ token: refreshToken, userId: user._id });

        res.json({
            accessToken,
            refreshToken,
        }); 
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token is required' });
        }

        const tokenData = await refreshTokens.findOne({ token: refreshToken });
        if (!tokenData) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const accessToken = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

            res.json({
                accessToken,
                refreshToken,
            });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        await refreshTokens.deleteOne({ token: refreshToken });

        res.json({ message:'Logout successfully'});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    register,
    login,
    logout,
    refresh,
};