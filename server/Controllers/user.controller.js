const userModel = require("../Models/user.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");

const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY;

    return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" })
}

const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body

        let user = await userModel.findOne({ email })

        if (user) return res.status(404).json("Email already register");

        if (!name || !email || !password) return res.status(400).json("All Fields are required");

        if (!validator.isEmail(email)) return res.status(400).json("Email must be a Valid email");
        if (!validator.isStrongPassword(password)) return res.status(400).json("Password must be strong with one special character one number and one character");

        user = new userModel({ name, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();

        const token = createToken(user._id);
        res.status(200).json({ _id: user._id, name, email, token })
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }

}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid password" });
        }

        const token = createToken(user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token
        });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};


const findUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Find user error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await userModel.find();
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Find user error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};


module.exports = { registerUser, loginUser, findUser,getUser };