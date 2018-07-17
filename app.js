var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var assert = require('assert')

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

var kafka = require('kafka-node');
var HighLevelProducer = kafka.HighLevelProducer;
var producerClient = new kafka.Client();
var Consumer = kafka.Consumer;
var consumerClient = new kafka.Client();
var consumer = new Consumer(
    consumerClient,
    [
        { topic: 'sum', partition: 0 }
    ],
    {
        autoCommit: false
    }
);
var producer = new HighLevelProducer(producerClient);

const cassandra = require('cassandra-driver');
const cassandraClient = new cassandra.Client({ contactPoints: ['localhost'], keyspace: 'test' });


producer.on('ready', function() {
    console.log('producer is ready!');
});

consumer.on('message', function (message) {
  io.emit('refresh');
  console.log(message);
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
                        topic: "test",
                        messages: JSON.stringify(response)
                }
        ];
        producer.send(record, function(data, err) {
                console.log(data);
        });



        const query = 'INSERT INTO purchase (username, event_time, points) VALUES (?, ?, ?)';
        const params = [req.body.username, new Date(), req.body.purchase_amount];
        cassandraClient.execute(query, params, { prepare: true }, function(err) {
          assert.ifError(err);
        });

        console.log(response);
        res.redirect('/');
});
//
// app.get('/top', function(req,res)) {
//
//   res.send()
// }

http.listen(3000,function() {
  console.log('test app listening on port 3000!');
})
