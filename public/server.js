const express = require('express')
const cors = require('cors')
const app = express()
const path = require('path')

app.use(express.json())
app.use(cors())

// include and initialize the rollbar library with your access token
var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: 'f30fd6615c0e400087885e8c6ff8e1a4',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
rollbar.log('Hello world!')

const grocery = ['Apples', 'Milk', 'Butter', 'Coffee']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/grocery', (req, res) => {
    res.status(200).send(grocery)
})

app.post('/api/grocery', (req, res) => {
   let {name} = req.body

   const index = grocery.findIndex(item => {
       return item === name
   })

   try {
       if (index === -1 && name !== '') {
           grocery.push(name)
           rollbar.log('Grocery item successfully added')
           res.status(200).send(grocery)
       } else if (name === ''){
            rollbar.warning('No item provided')
           res.status(400).send('You must enter a grocery item.')
       } else {
            rollbar.critical('Duplicate item attempted')
           res.status(400).send('That item already exists.')
       }
   } catch (err) {
       console.log(err)
   }
})

app.delete('/api/grocery/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    grocery.splice(targetIndex, 1)

    rollbar.log('Grocery list item Deleted')
    res.status(200).send(grocery)
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
