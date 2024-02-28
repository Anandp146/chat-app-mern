const User = require("../models/userModel");
const bcrypt = require('bcrypt');
//check user details
module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck) {
            return res.json({ msg: "Username already used", status: false });
        }
        //check email is usedd or not
        const emailCheck = await User.findOne({ email });
        if (emailCheck) {
            return res.json({ msg: "Email already used", status: false });
        }
        //save password in increpted form
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            username,
            password: hashedPassword,
        });
        delete user.password;
        return res.json({ status: true, user });
    } catch (ex) {
        next(ex);
    }
};
module.exports.login = async (req, res, next) => {
    try {
        // Extract username and password from the request body
        const { username, password } = req.body;
        // Find a user in the database based on the provided username
        const user = await User.findOne({ username });
        // If no user is found, return an error response
        if (!user) {
            return res.json({ msg: "Incorrect Username or password", status: false });
        }
        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        // If the passwords do not match, return an error response
        if (!isPasswordValid) {
            return res.json({ msg: "Incorrect Username or password", status: false });
        }
        // If the login is successful, delete the password from the user object
        delete user.password;
        // Return a success response with the user object (excluding the password)
        return res.json({ status: true, user });
    } catch (ex) {
        // If an exception occurs during the try block, pass it to the error-handling middleware
        next(ex);
    }
};
module.exports.setAvatar = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const avatarImage = req.body.image;
        const userData = await User.findByIdAndUpdate(
            userId,
            {
                isAvatarImageSet: true,
                avatarImage,
            },
            { new: true }
        );
        return res.json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
        });
    } catch (ex) {
        next(ex);
    }
};
// ye specified ID ke alawa sabhi users ko fetch karta hai
module.exports.getAllUsers = async (req, res, next) => {
    try {
        //specified ID wale user ko exclude karke Database se users fetch karo
        const users = await User.find({ _id: { $ne: req.params.id } }).select(["email", "username", "avatarImage", "_id"]);
        return res.json(users);
    } catch (ex) {
        // if exception occur then error handling middleware ko pass karo
        next(ex);
    }
};

module.exports.logOut = (req, res, next) => {
    try {
        if (!req.params.id) return res.json({ msg: "User id is required " });
        onlineUsers.delete(req.params.id);
        return res.status(200).send();
    } catch (ex) {
        next(ex);
    }
};
