const express = require('express')
const app = express()
const port = 3000

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
app.use(express.json()); // Parse JSON request bodies


app.get('/', (req, res) => {
  res.render("index")
})

const idxMarketController = require('./controllers/idxMarketController');
app.post('/idxMarket', idxMarketController);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`http://localhost:3000/`)
})