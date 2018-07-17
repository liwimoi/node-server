var express = require('express');
var app = express();
const {writeFileSync, readFileSync} = require('fs');


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
        res.send({
          result: 200,
        })
});

app.post('/list', function(req, res){
        let result;
        const {page, pageSize} = req.body;
        const firstIdx = (page - 1) * pageSize;
        try {
                result  = JSON.parse(readFileSync('./tmp/list.json', 'utf8'));
                result = result.splice(firstIdx, pageSize);
        } catch (e) {
                console.log('read file error..');
                res.send({
                  result: []
                });
        }

        res.send({
          result: result
        });
});

app.get('/createList', function(req, res){
        console.log('createJSONFile..');
        let listItems = [];
        for (let i = 0; i < 60; i++) {
                listItems.push({
                  id: i + 1
                });
        }
        const data = JSON.stringify(listItems, null, '\t');
        writeFileSync('./tmp/list.json', data);
        res.send({
          result: 'creat..'
        });
});

app.listen(3000, function() {
        console.log('test app listening on port 3000!');
});