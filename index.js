const express = require('express');
const router = express.Router();
const con = require('./connection.js');
const jwt = require("jsonwebtoken");
const md5 = require('md5');

router.post('/user/login', async function (req, res, next) {
    console.log("./login was called...");
    //console.log(req.query); // query paraméterek itt vannak (GET-nél)
    try {
        let { username, password } = req.body;

        const hashed_password = md5(password.toString());

        const sql = `SELECT * FROM user WHERE user_name = ? AND user_password = ?`;
        const params = [username, hashed_password];
        con.query(
            sql, params,
            function(err, result, fields){
                if (err) {
                    res.send(err);
                } else {
                    if (Array.isArray(result) && result.length == 1){
                        console.log("Bejelentkezve");
                        let token = jwt.sign({ data: result }, 'secret')
                        res.send({ status: 1, data: err, token: token });
                    }
                    else {
                        //res.send("Hibás, vagy nem létező adatok!!");
                        res.send({ status: 0, data: result});
                    }
                }
            })
    } catch (error) {
        res.send({ status: 0, error: error });
    }
});


router.post('/user/register', async function (req, res, next) {
    console.log("./registration was called...");
    //console.log(req.query.user_name); // query paraméterek itt vannak (POST-nál is van)
    //console.log(req.body); // body itt vannak (POST-nál)
    try {
        let { user_name, user_email, user_password } = req.body;

        const sql1 = `SELECT * FROM user WHERE user_name = ? OR user_email = ?`;
        const params1 = [ user_name, user_email];
        con.query(
            sql1, params1,
            function(err1, result1, fields1){
                if (err1) {
                    res.send(err1);
                } else {
                    if (Array.isArray(result1) && result1.length == 0){
                        console.log("Ok, mehet a regisztáció");
                        ///res.send.check(true);
                        //res.send.body("Ok, mehet a regisztáció");
                        //res.send("Ok, mehet a regisztáció");
                        const moment = require("moment");
                        const current_timestamp = moment().format(" YYYY-MM-DD HH:mm:ss");

                        const hashed_password = md5(user_password.toString());

                        const sql2 = `INSERT INTO user (user_name, user_email, user_password, user_create_time) VALUES (?, ?, ?, ?)`;
                        const params2 = [ user_name, user_email, hashed_password, current_timestamp];
                        con.query(
                            sql2, params2,
                            function(err2, result2, fields2){
                                if (err2) {
                                    //res.send(err2);
                                    res.send({ status: 1, data: err2 });
                                } else {
                                    //res.send("sikerült");
                                    let token = jwt.sign({ data: result2 }, 'secret')
                                    console.log(result2);
                                    res.send({ status: 1, data: result2, token : token, CheckToken : true , msg: "Sikeres regiszrtáció"});
                                }
                            });
                    }
                    else {
                        console.log("A felasználónév vagy az email cím már foglalt!!");
                        console.log(result1);
                        //res.send.check(false);
                        //res.send.body("A felasználónév vagy az email cím már foglalt!!   ");
                        //res.send("A felasználónév vagy az email cím már foglalt!!");
                        res.send({ status: 1, data: "A felasználónév vagy az email cím már foglalt!!", CheckToken : false, msg: "Sikertelen regiszrtáció: A felasználónév vagy az email cím már foglalt!" });
                    }
                }
            });

    }
    catch (error) {
        res.send(error);
    }
});


module.exports = router;
