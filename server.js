'use strict';

const express = require('express');
const app = express();

require('dotenv').config();

const cors = require('cors');
app.use(cors());

const superagent = require('superagent');


app.use(express.urlencoded({ extended: true }))
const methodoverride = require('method-override')
app.use(methodoverride('_method'))

app.use(express.static('./public'))
app.set('view engine', 'ejs')

const pg = require('pg');
// const client = new pg.Client(process.env.DATABASE_URL)
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

const port = process.env.PORT || 4000



app.get('/',homeHandler)
app.post('/getCountryResult',countryHandler)
app.get('/AllCountries',allcountryHandler)
app.get('/MyRecords',recordHandler)
app.post('/MyRecords' , addrecordHandler)
app.get('/details/:id',detailDataHandler)
app.post('/details/:id',detailsHandler)
app.delete('/details/:id',deleteHandler)



function deleteHandler(req,res){
    let SQL = `DELETE FROM country WHERE id=${req.params.id}`
    client.query(SQL)
    .then(()=>{
        res.redirect('/MyRecords')
    })
}

function detailDataHandler(req,res){
    let SQL = `SELECT * FROM country WHERE id=${req.params.id}`

    client.query(SQL)
    .then(result=>{
        res.render('pages/RecordDetails',{DATA:result.rows[0]})
    })
}


function detailsHandler(req,res){
    res.redirect(`/details/${req.params.id}`)
}



function addrecordHandler(req,res){
    let SQL = `INSERT INTO country(country,totalconfirmed,totaldeaths,totalrecovered,date) VALUES ($1,$2,$3,$4,$5)`
    let Body = req.body
   
    let safevalues = [Body.country,Body.totalconfirmed,Body.totaldeaths,Body.totalrecovered,Body.date];   
    client.query(SQL,safevalues)
    .then(()=>{
        res.redirect('/MyRecords')
    })
    
}

function recordHandler(req,res){
    let SQL = `SELECT * FROM country;`
    client.query(SQL)
    .then(result=>{
        console.log(result.rows)
        res.render('pages/MyRecords',{DATA:result.rows})
    })
}


function allcountryHandler(req,res){
let url = `https://api.covid19api.com/summary`

superagent.get(url)
.then(result=>{
    let countryArr = result.body.Countries.map(val=>{
        return new Country(val)
    })
    res.render('pages/AllCountries',{DATA:countryArr})
})

}


function countryHandler(req,res){

    let country = req.body.search
    let from = req.body.from
    let to = req.body.to

    let url =`https://api.covid19api.com/country/${country}/status/confirmed?from=${from}T00:00:00Z&to=${to}T00:00:00Z`

superagent.get(url)
.then(result=>{
    res.render('pages/getCountryResult',{DATA:result.body})
})


}

function homeHandler(req,res){
    let url = `https://api.covid19api.com/world/total`

    superagent.get(url)
    .then(result=>{
        res.render('pages/homePage',{DATA:result.body})
    })
}

function Country(val){
    this.Country = val.Country
    this.TotalConfirmed = val.TotalConfirmed
    this.TotalDeaths = val.TotalDeaths
    this.TotalRecovered = val.TotalRecovered
    this.Date = val.Date
}













client.connect()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Hearing from port ${port}`)
    })
})


