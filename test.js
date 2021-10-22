const tf = require('@tensorflow/tfjs-node');
const axios = require('axios')

async function test(array) { 

    instances = await array.array()
    data =  JSON.stringify({"signature_name": "serving_default", "instances": instances})
    let axiosConfig = {
        headers : {"content-type": "application/json"}
    }  
    return_data = await axios
        .post('https://painter-image-gcrk6gkrcq-uc.a.run.app/v1/models/painter:predict', data, axiosConfig)
        .then(res => {
            console.log(`statusCode: ${res.status}`)
            //predictions = JSON.parse(res.text)['predictions']
            console.log('Response recieved')
            return res.data.predictions
            })
        .catch(error => {
            console.error(error)
            return error
            })
    console.log( tf.tensor( JSON.parse( JSON.stringify(return_data) ) ) )
    /*prediction = tf.tensor(return_data)
    //eliminate batch dimension before converting to pixels
    prediction = prediction[0]
    //normalize tensor to [0,1] before toPixels() call
    prediction = prediction.mul(0.5)
    half_tensor = tf.onesLike(prediction).mul(0.5)
    prediction = prediction.add(half_tensor)
    const array = await tf.browser.toPixels(prediction)
    console.log("Array: ", array)*/
}

tensor = tf.randomUniform(shape = [1,256,256,3])

test(tensor)



//test(input_tensor) 

