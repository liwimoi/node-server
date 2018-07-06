var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

var kafka = require('kafka-node');
var HighLevelProducer = kafka.HighLevelProducer;
var client = new kafka.Client();
var producer = new HighLevelProducer(client);

producer.on('ready', function() {
        console.log('producer is ready!');
});

app.get('/', function(req, res) {
    res.sendFile( __dirname + "/" + "index.html");
});

app.post('/purchase', function(req, res) {
        response = {
                username: req.body.username,
                amount: req.body.purchase_amount,
        };
        const record = [
                {
                        topic: "node-producer",
                        messages: JSON.stringify(response)
                }
        ];
        producer.send(record, function(data, err) {
                console.log(data);
        });
        console.log(response);
        res.redirect('/');
});


app.listen(3000, function() {
        console.log('test app listening on port 3000!');
});

