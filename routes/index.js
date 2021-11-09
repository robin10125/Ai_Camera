var express = require('express');
var router = express.Router();
const axios = require('axios')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Ai-Camera' });
});

//POST request receive image data
router.post('/image', async function(req,res,next){

  //get data and convert to tensor, then to array, then to JSON object
  parsed = JSON.parse(JSON.stringify(req.body))
  tensor = parsed.data
  model = parsed.model
  
  if (model == 'impressionism_neural_style_transfer'){link = 'https://impressionism-nst01-image-gcrk6gkrcq-uc.a.run.app/v1/models/impressionism_style_transfer01:predict'}
  if (model == 'impressionism_test'){link = 'https://painter-image-gcrk6gkrcq-uc.a.run.app/v1/models/painter:predict'}
  if (model == 'impressionism_cycle_gan'){link = 'https://impressionism-image-gcrk6gkrcq-uc.a.run.app/v1/models/impressionism:predict'}

  data =  JSON.stringify({"signature_name": "serving_default", "instances": tensor})
  axiosConfig = {
    headers : {"content-type": "application/json"}
    }
  
  //POST image data to tensorflow painter model server     
  return_data = await axios
    .post(link, data, axiosConfig)
    .then(res => {
      console.log(`statusCode: ${res.status}`)
      return res.data.predictions
      })
    .catch(error => {
      console.error(error)
      return error
      })
//send back translated image as response
res.send({'image': return_data})
})

module.exports = router;
