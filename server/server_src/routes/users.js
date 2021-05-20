const express = require("express");

const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

// User Modal
const User = require("../models/User.js");

const token = require("../config/token.js");

const { Token } = token;

async function enable() {
    // Login Page
    router.get("/login", (req, res) =>
        res.render("login", {
            page: "Login",
        })
    );
    // Register Page
        router.get("/register", (req, res) =>
            res.render("register", {
                page: "Register",
                serverSettings: settings,
            })
        );

        // Register Handle
        router.post("/register", (req, res) => {
            const { name, username, password, password2 } = req.body;
            const errors = [];

            // Check required fields
            if (!name || !username || !password || !password2) {
                errors.push({ msg: "Please fill in all fields..." });
            }

            // Check passwords match
            if (password !== password2) {
                errors.push({ msg: "Passwords do not match..." });
            }

            // Password at least 6 characters
            if (password.length < 6) {
                errors.push({ msg: "Password should be at least 6 characters..." });
            }

            if (errors.length > 0) {
                res.render("register", {
                    page: "Login",
                    registration: settings[0].server.registration,
                    serverSettings: settings,
                    errors,
                    name,
                    username,
                    password,
                    password2,
                });
            } else {
                // Validation Passed
                User.findOne({ username }).then((user) => {
                    if (user) {
                        // User exists
                        errors.push({ msg: "Username is already registered" });
                        res.render("register", {
                            page: "Login",
                            registration: settings[0].server.registration,
                            serverSettings: settings,
                            errors,
                            name,
                            username,
                            password,
                            password2,
                        });
                    } else {
                        // Check if first user that's created.
                        User.find({}).then((user) => {
                            let userGroup = "";
                            if (user.length < 1) {
                                userGroup = "Administrator";
                            } else {
                                userGroup = "User";
                            }
                            const newUser = new User({
                                name,
                                username,
                                password,
                                group: userGroup,
                            });
                            // Hash Password
                            bcrypt.genSalt(10, (error, salt) =>
                                bcrypt.hash(newUser.password, salt, (err, hash) => {
                                    if (err) throw err;
                                    // Set password to hashed
                                    newUser.password = hash;
                                    // Save new User
                                    newUser
                                        .save()
                                        .then((user) => {
                                            const page = "login";
                                            res.redirect("/users/login");
                                        })
                                        .catch((err) => console.log(err));
                                })
                            );
                        });
                    }
                });
            }
        });
    // Login Handle
    router.post('/login',
        passport.authenticate('local', {
            // successRedirect: "/dashboard",
            failureRedirect: "/users/login",
            failureFlash: true,
            page: "Login"
        }),
        function(req, res, next) {
            // Issue a remember me cookie if the option was checked
            if (!req.body.remember_me) { return next(); }

            Token.issueToken(req.user, function(err, token) {
                if (err) { return next(err); }
                res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
                return next();
            });
        },
        function(req, res) {
            res.redirect('/dashboard');
        });

    // Logout Handle
    router.get("/logout", (req, res) => {
        req.logout();
        res.redirect("/users/login");
    });
}

enable();

module.exports = router;
