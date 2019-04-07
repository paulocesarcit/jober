const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const sqlite = require('sqlite')
const dbConnection = sqlite.open('banco.sqlite', { Promise })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', async(req, res) => {
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias')
    const vagas = await db.all('select * from vagas')
    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter(vaga => vaga.categoria === cat.id)
        }
    })
    res.render('home', {
        categorias
    })
})

app.get('/vaga/:id', async(req, res) => {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = ' + req.params.id)
    res.render('vaga', {
        vaga
    })
})

app.get('/admin', (req, res) => {
    res.render('admin/home')
})

app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas')
    res.render('admin/vagas', {
        vagas
    })
})

app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = ' + req.params.id)
    res.redirect('/admin/vagas')
})

app.get('/admin/nova-vaga', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga', {
        categorias
    })
})

app.post('/admin/nova-vaga', async(req, res) => {
    const db = await dbConnection
    const {titulo, descricao, categoria} = req.body
    await db.run(`insert into vagas(categoria, titulo, descricao) values('${categoria}', '${titulo}', '${descricao}')`)
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const vaga = await db.get('select * from vagas where id = ' + req.params.id)
    res.render('admin/editar-vaga', {
        categorias,
        vaga
    })
})

app.post('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    const {id} = req.params
    const {titulo, descricao, categoria} = req.body
    await db.run(`update vagas set categoria=${categoria}, titulo='${titulo}', descricao='${descricao}' where id=${id}`)
    res.redirect('/admin/vagas')
})

const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT)')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT)')
}
init()

app.listen(3000, (err) => {
    if (err) {
        console.log('Error on starting server')
    } else {
        console.log('Server started on http://localhost:3000/')
    }
})
