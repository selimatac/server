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
        console.log(query, cat)
        console.log(cat)
        if (!err) {
            res.send({ isSuccess: true })
        } else {
            res.send({ isSuccess: false })
            console.log(err);
        }
    });
});

app.put('/updateCategory', (req, res) => {
    let cat = req.body;
    var query = "UPDATE categories SET name=?,saved_by=? WHERE id = ?"
    mysqlConnection.query(query, [cat.name, cat.saved_by, cat.id], (err, rows, fields) => {
        console.log(query, cat)
        console.log(cat)
        if (!err) {
            res.send({ isSuccess: true })
        } else {
            res.send({ isSuccess: false })
            console.log(err);
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
        console.log(query, product)
        console.log(product)
        if (!err) {
            res.send({ isSuccess: true })
        } else {
            res.send({ isSuccess: false })
            console.log(err);
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