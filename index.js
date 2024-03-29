const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
var cors = require('cors');
var corsOptions = {
    origin: 'http://localhost:3000',
}
app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());


var mysqlConnection = mysql.createConnection({
    host: "94.73.151.142",
    user: "u8554496_flwr_shop",
    password: "*KD{?axWEj^b",
    database: "u8554496_flwr_shop",
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err) {
        console.log("Connected")
    } else {
        console.log("Connection Failed")
    }
});

app.listen(3306);

app.get('/category', (req, res) => {
    mysqlConnection.query('SELECT * FROM `categories`', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});

app.get('/category/:id', (req, res) => {
    mysqlConnection.query('SELECT * FROM `categories` WHERE id= ?', [req.params.id], (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});

app.post('/insertCategory', (req, res) => {
    let cat = req.body;
    var query = "INSERT INTO categories(name, saved_by, parent_id) VALUES (?,?,?)"
    mysqlConnection.query(query, [cat.name, cat.saved_by, cat.parent_id], (err, rows, fields) => {
        if (!err) {
            res.send({ isSuccess: true })
        } else {
            res.send({ isSuccess: false })
        }
    });
});

app.put('/updateCategory', (req, res) => {
    let cat = req.body;
    var query = "UPDATE categories SET name=?,saved_by=? WHERE id = ?"
    mysqlConnection.query(query, [cat.name, cat.saved_by, cat.id], (err, rows, fields) => {
        if (!err) {
            res.send({ isSuccess: true })
        } else {
            res.send({ isSuccess: false })
        }
    });
});

//products all or by category
app.get(['/products/:category', '/products'], (req, res) => {
    if (req.params.category) {
        mysqlConnection.query('SELECT * FROM `products` where JSON_EXTRACT(product_info, "$.category.value") = ?', [req.params.category], (err, rows, fields) => {
            if (!err) {
                res.send(rows);
            } else {
                console.log(err);
            }
        });
    } else {
        mysqlConnection.query('SELECT * FROM `products`', (err, rows, fields) => {
            if (!err) {
                res.send(rows);
            } else {
                console.log(err);
            }
        });
    }
});

//one product
app.get('/product/:product', (req, res) => {
    mysqlConnection.query('SELECT * FROM `products` WHERE id= ? OR JSON_EXTRACT(product_info, "$.slug") = ? ', [req.params.id, req.params.product], (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});

app.post('/insertProduct', (req, res) => {
    let product = req.body;
    var query = "INSERT INTO products(product_info, saved_by) VALUES (?,?)"
    mysqlConnection.query(query, [product.product_info, product.saved_by], (err, rows, fields) => {
        if (!err) {
            res.send({ isSuccess: true })
        } else {
            res.send({ isSuccess: false })
        }
    });
});

//kategori ve ürünlerde arama.
app.post('/search', (req, res) => {
    mysqlConnection.query(`SELECT * FROM products WHERE JSON_UNQUOTE(JSON_EXTRACT(product_info, '$.name')) LIKE '%${req.body.text}%'`, (err, rows, fields,) => {
        if (!err) {

            mysqlConnection.query(`SELECT * FROM categories WHERE name LIKE '%${req.body.text}%'`, (err2, rows2, fields2) => {
                if (!err2) {
                    if(req.body.text){
                        res.send({
                            product:rows,
                            category:rows2
                        });
                    }else{
                        res.send([]);
                    }
                } else {
                    console.log(err2);
                }
            });
        } else {
            console.log(err);
        }
    });
});


//Customers

app.post('/insertCustomer', (req, res) => {
    let cus = req.body;
    var query = "INSERT INTO customers(customer_info) VALUES (?)"
    var checkUser = "SELECT * FROM customers WHERE JSON_UNQUOTE(JSON_EXTRACT(`customer_info`, '$.email')) ='"+JSON.parse(req.body.customer_info).email+"'";
    mysqlConnection.query(checkUser, (err, rows, fields) => {
        if (!err) {
            if(rows.length == 0){
                mysqlConnection.query(query, [cus.customer_info], (err, rows, fields) => {
                    if (!err) {
                    res.send({ isSuccess: true })
                } else {
                    res.send({ isSuccess: false })
                }
            });
            }else{
                res.send({ isSuccess: true, errorMessage:"Lütfen farklı bir mail adresi ile deneyiniz." })
            }
        } else {
            console.log(err);
        }
    });
    
});

app.post('/customerLogin', (req, res) => {
    let cus = req.body;
    var query = "SELECT * FROM customers WHERE JSON_UNQUOTE(JSON_EXTRACT(`customer_info`, '$.email')) = ? AND JSON_UNQUOTE(JSON_EXTRACT(`customer_info`, '$.password')) =?"
    mysqlConnection.query(query, [cus.email,cus.password], (err, rows, fields) => {
            if (!err) {
                if(rows.length == 0){
                    res.send([{ isLoggedIn: false }])
                }else{
                    var g = rows;
                    g[0].isLoggedIn = true
                    res.send(g)
                }
        } else {
            res.send({ isSuccess: false })
        }
    });
});

//Silinip admin tarafına taşınacak
app.get('/getAllCustomers', (req, res) => {
    mysqlConnection.query('SELECT * FROM `customers`', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});

