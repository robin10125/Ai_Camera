var socket = io();
const input = document.createElement('img')
const input_thumbnail = document.getElementById('thumbnail')
const canvas = document.getElementById("prediction")
const console_container = document.getElementById('console-container')
const img_container = document.getElementById('image-container')
const canvas_container = document.getElementById('canvas-container')
var model_select = 'impressionism'

input.style.display = 'none'
//set model to impresdsionism by default
document.getElementById('models').addEventListener('change', (e) =>{model_select = e.target.value})
//set model to selection

document.getElementById('input').addEventListener("change", (e) => {
    if (e.target.files[0]){
        (async function() {
            const file = e.target.files[0]
            const url = URL.createObjectURL(file)
            input.src = url
            input_thumbnail.src = url
            input_thumbnail.width = 256
            input_thumbnail.height = 256
        })()
}
    
});

document.getElementById('submit').addEventListener("click", () => {

   //get min to crop image by min dimension 
   const min = ((height = input.height, width = input.width) => {
        if (height > width) return width;
        else return height; 
    }) ()
    console.log(min, input.height, input.width)
    
    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')
    var height = input.height 
    var width = input.width
    canvas.width = 256
    canvas.height = 256
    if (height % 2 != 0) height += -1
    if (width % 2 != 0) width += -1
    //crop image and resize to 256 on canvas
    context.drawImage(input, 
        (width/2 - min/2), (height/2 - min/2),
        min, min,
        0,0,
        256,256)
    var imageData = context.getImageData( 0 , 0, 256, 256 )
    console.log(imageData.data)
    const exportObject = {bufferData: imageData.data.buffer, model: model_select}
    //socket.emit('image', imageData.data.buffer)
    socket.emit('image', exportObject)
    canvas.remove()
});

socket.on('prediction', (image) => {
    
    //use tensorflow toPixels to convert tensor to image on display
    const array = new Uint8Array(image)
    tensor= tf.tensor(array).reshape([256,256,-1])
    console.log(tensor)
    canvas.width = tensor.shape.width
    canvas.height = tensor.shape.height
    tf.browser.toPixels(tensor, canvas)
})