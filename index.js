const tf = require('@tensorflow/tfjs-node');
const express = require('express');
const port = process.env.PORT || 8080;

function preprocess_image(buffer_img){
    console.log(buffer_img)
    //convert bytearray to tensor
    img_tensor = tf.tensor(buffer_img).reshape([256,256,-1])      
    //remove luminance channel from tensor
    img_tensor = img_tensor.slice([0,0,0], [-1,-1,3])     
     //normalize image to [-1,1]
    img_tensor = tf.cast(img_tensor, 'float32')
    img_tensor = img_tensor.mul(1/127.5)
    one_tensor = tf.onesLike(img_tensor)
    input_tensor = img_tensor.sub(one_tensor)
    input_tensor = input_tensor.expandDims(axis = 0)
    return input_tensor
}

async function runServer() {
    const model = await tf.node.loadSavedModel('./Painter'); 
    const app = express();

    app.use(express.json());

    app.post('/prediction', (req, res) => {
        input_tensor = preprocess_image(req.body.buffer)
        model.predict([req.body.sentence]).then((predictions) => {
        // Send the response to the user
            res.json({
                predictions,
            });
        });
    });

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

runServer();