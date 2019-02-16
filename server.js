var five = require("johnny-five");
var board = new five.Board({'port':'COM3'});

var express = require('express');
var app = express();

var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://test.mosquitto.org') //broker

var led;
var distancia;
var ultimoStatusVaga;

board.on("ready", ()=> {
    led = new five.Led(13);

    var proximity = new five.Proximity({
        controller: "HCSR4",
        pin: 7
    });

    proximity.on("change", function(){
        distancia = this.cm;
        var statusAtual;
        if(distancia < 5){
            statusAtual = "Ocupada";
        } else {
            statusAtual = "Livre";
        }

        if(ultimoStatusVaga!==statusAtual){
            ultimoStatusVaga = statusAtual;
            client.publish('distancia03', ultimoStatusVaga);
        }
        
    })
});

//criar rota
app.post('/led/ligar', function(req, res){
    led.on();
    res.sendStatus(200);
});

app.post('/led/desligar', function(req, res){
    led.off();
    res.sendStatus(200);
});

app.get('/vaga',(req,res)=>{
    if(distancia <5){
        res.send("ocupada");
    }else{
        res.send("vazia");
    }
})

app.listen(3000, function(){
    console.log('app listening on port ${3000}');
})
