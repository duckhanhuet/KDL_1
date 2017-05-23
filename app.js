var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db    = require('mongoose');

let dem=0;

var request= require('request');
var async  = require('async')
var config= require('./config/config')

var app = express();

var GasController = require('./controller/GasController')

db.connect(config.host,(err,response)=>{
    if (err){
        console.log(err)
    }
});

let stack=[]

if(typeof require !== 'undefined') XLSX = require('xlsx');
var workbook = XLSX.readFile('GAS.xlsx');
var sheet_name_list = workbook.SheetNames;

sheet_name_list.forEach(function(y) { /* iterate through sheets */
    var worksheet = workbook.Sheets[y];
    var xxx = XLSX.utils.sheet_to_json(worksheet);
    xxx.forEach(function (item) {
        stack.push(item.address)
    })
})


function bodauTiengViet(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str= str.replace(/ /g,"+");
    str =str.replace(/, /g,"+");
    str= str.replace(/,/g,"");

    return str;
}


async.waterfall([
        function (callback) {
            let arrFunc=[];
            arrFunc.push(function (callback) {
                callback(null,[]);
            })
            for (let i=3000;i<4015;i++){
                let add= stack[i];
                let url='https://maps.googleapis.com/maps/api/geocode/json?address=';
                function func(results,callback) {
                    url= url+ bodauTiengViet(add)+'&key='+config.key;
                    getData(url,function (err, data) {
                        if (err){
                            callback(err,null)
                        }
                        callback(null,results.concat(data))
                    })
                }
                arrFunc.push(func);
            }
            async.waterfall(arrFunc,function (err,result) {
                if (err){
                    callback(err,null)
                }
                callback(null,result)
            })
        }
    ],
    function (err, response) {
        if (err){
            console.log(err)
        }
        console.log('import success');
    })

function getData(url, callback) {
    let listTour=[];
    async.waterfall([
            function (callback) {
                makeRequest(url,callback)
            },
            function (body, callback) {
                let info=body.results;
                let object={}
                try {
                    for (let i=0;i<info.length;i++){
                        object={
                            url: url,
                            latitude: info[0].geometry.location.lat,
                            longitude : info[0].geometry.location.lng
                        }
                    }
                } catch (err){
                    object={
                        url: url,
                        latitude: 15.8449082,
                        longitude: 108.2080973
                    }
                }
                dem=dem+1;
                console.log('STT:',dem)
                if (Object.keys(object).length === 0){
                    object={
                        url: url,
                        latitude: 15.8449082,
                        longitude: 108.2080973
                    }
                }

                GasController.create(object,function (err, results) {
                    if (err){
                        console.log('import fall')
                    }
                })

                listTour.push(object);

                console.log(object)
                callback(null,listTour)
            }

        ]
        ,function (err, result) {
            if (err){
                callback(err,null)
            }
            callback(null,result)
        })
}


function makeRequest(url, callback) {

    request({
        uri: url,
        method: "GET",
        timeout: 200000,
        followRedirect: true,
        maxRedirects: 10,
        json: true
    }, function (err, response, body) {
        if (err) {
            callback(err, null)
            return;
        }
        else {
            //console.log(url)
            callback(null, body)
        }
    })
}