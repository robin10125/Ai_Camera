var io = require('socket.io')()
const tf = require('@tensorflow/tfjs-node');
const axios = require('axios')

function preprocess_image(buffer_img){
    //convert bytearray to tensor
    img_tensor = tf.tensor(buffer_img).reshape([256,256,-1])      
    //remove luminance channel from tensor
    img_tensor = img_tensor.slice([0,0,0], [-1,-1,3])     
     //normalize image to [-1,1]
    img_tensor = tf.cast(img_tensor, 'float32')
    img_tensor = img_tensor.mul(1/127.5)
    one_tensor = tf.onesLike(img_tensor)
    input_tensor = img_tensor.sub(one_tensor)
    //add batch dimension
    input_tensor = input_tensor.expandDims(axis = 0)
    return input_tensor
}

//on connection socket listens for image data to come from client, processes image data, sends inference POST and emits response back to client
io.on('connection', function(socket){
  console.log("--------------------------------------Connected to websockets--------------------------------------")
  //parameter buffer_img object containing bytearray of image in bufferData, as well as string for model type
  //TODO: uppload new models
  socket.on('image', async (buffer_img) => {
    //model_type so far unused due to only 1 model type
    //model_type = buffer_img.model
    buffer_img = buffer_img.bufferData
    //preprocess image
    input_tensor = preprocess_image(buffer_img)
    instances = await input_tensor.array()

    data =  JSON.stringify({"signature_name": "serving_default", "instances": instances})
    axiosConfig = {
      headers : {"content-type": "application/json"}
      }
    //POST image data to TF model server     
    return_data = await axios
      .post('https://painter-image-gcrk6gkrcq-uc.a.run.app/v1/models/painter:predict', data, axiosConfig)
      .then(res => {
        console.log(`statusCode: ${res.status}`)
        return res.data.predictions
        })
      .catch(error => {
        console.error(error)
        return error
        })
    prediction_array = JSON.parse(JSON.stringify(return_data))
    prediction = tf.tensor(prediction_array)
    //eliminate batch dimension before converting to pixels
    prediction = await tf.squeeze(prediction, axis=0)
    //normalize tensor to [0,1] before toPixels() call
    prediction = prediction.mul(0.5)
    half_tensor = tf.onesLike(prediction).mul(0.5)
    prediction = prediction.add(half_tensor)
    const array = await tf.browser.toPixels(prediction)
    //emit back to client
    socket.emit('prediction', array)        
  })
})

module.exports = io;

