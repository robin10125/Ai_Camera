var io = require('socket.io')()
const tf = require('@tensorflow/tfjs-node-gpu');
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
(async function() {
    const model = await tf.node.loadSavedModel('./Painter'); 

    io.on('connection', function(socket){
        console.log("--------------------------------------Connected to websockets--------------------------------------")
        socket.on('image', async (buffer_img) => {
            model_type = buffer_img.model
            buffer_img = buffer_img.bufferData
            input_tensor = preprocess_image(buffer_img)
            prediction = model.predict(input_tensor)
             //eliminate batch dimension before converting to pixels
            prediction = await prediction.squeeze(axis=0)
            //normalize tensor to [0,1] before toPixels() call
            prediction = prediction.mul(0.5)
            half_tensor = tf.onesLike(prediction).mul(0.5)
            prediction = prediction.add(half_tensor)

            const array = await tf.browser.toPixels(prediction)
            //emit back to client
            console.log(prediction)
            socket.emit('prediction', array)
        })
    })
})();

module.exports = io;
