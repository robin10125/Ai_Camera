const input = document.createElement('img')
const input_thumbnail = document.getElementById('thumbnail')
var canvas_prediction = document.getElementById("prediction")
const console_container = document.getElementById('console-container')
const img_container = document.getElementById('image-container')
const canvas_container = document.getElementById('canvas-container')
loader = document.getElementById('loader')

input.style.display = 'none'

var model_select = 'impressionism_neural_style_transfer'
//set model to selection
document.getElementById('models').addEventListener('change', (e) =>{model_select = e.target.value})

//set up input image
//TODO: make sure proper filetype uploaded
document.getElementById('input').addEventListener("change", (e) => {
    if (e.target.files[0]){
        (() => {
            const file = e.target.files[0]
            const url = URL.createObjectURL(file)
            input.src = url
            input_thumbnail.src = url
            input_thumbnail.width = 256
            input_thumbnail.height = 256
        })()
    }
});

//submit image for image translation
document.getElementById('submit').addEventListener("click", async () => {
    //create loading bar that is removed after response
    loader.innerHTML = '<div class = loader>'
    
    //get min to crop image by min dimension 
    width = input.width
    height = input.height
    const min = ((height = input.height, width = input.width) => {
        if (height > width) return width;
        else return height; 
    }) ()
    
    //helper canvas to preprocess image
    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')
    var height = input.height 
    var width = input.width
    canvas.width = 256
    canvas.height = 256

    //adjust height/width values to be evenly divisible by 2, used for cropping image to proper size
    if (height % 2 != 0) height += -1
    if (width % 2 != 0) width += -1
    //crop image and resize to 256 on canvas
    context.drawImage(input, 
        (width/2 - min/2), (height/2 - min/2),
        min, min,
        0,0,
        256,256)
    
    //convert to tensor, and normalize from [0,255] to [-1,1]
    image_tensor = await tf.browser.fromPixels(canvas).expandDims(axis=0)
    image_tensor = tf.cast(image_tensor, 'float32')
    image_tensor = image_tensor.mul(1/127.5)
    one_tensor = tf.onesLike(image_tensor)
    input_tensor = image_tensor.sub(one_tensor)

    //convert to array and JSON
    instances = await input_tensor.array()
    data =  JSON.stringify({instances})
    exportObj= JSON.stringify({data:instances, model:model_select})
    
    
    //POST image data to server
    axiosConfig = {
        headers : {"content-type": "application/json"}
        }  
     
    return_data = await axios
      .post('/image', exportObj, axiosConfig)
      .then(res => {
        console.log(`statusCode: ${res.status}`)
        return res.data.image
        })
      .catch(error => {
        console.error(error)
        return error
        })
    
        loader.innerHTML = ''
   
    //convert response array to tensor, and postprocess (remove batch dim, normalize to [0,1])
    new_tensor = tf.tensor(return_data)
    new_tensor = tf.squeeze(new_tensor, axis=0)
    new_tensor = new_tensor.mul(0.5)
    half_tensor = tf.onesLike(new_tensor).mul(0.5)
    new_tensor = new_tensor.add(half_tensor)
    
    //draw tensor image to canvas
    canvas_prediction.width = 256
    canvas_prediction.height = 256
    tf.browser.toPixels(new_tensor, canvas_prediction)
    
});