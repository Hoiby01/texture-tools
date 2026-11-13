import './style.css';

//Create references for inputs
const uploadButton = document.querySelector('#uploadButton');
const outputPreview = document.querySelector('#outputPreview')
const uploadForm = document.querySelector('#imageUploadForm');
const pixelateFactorSlider = document.querySelector('#pixelateFactorSlider');
const output = document.querySelector("#output");
const posterizationSlider = document.querySelector('#posterizationSlider');
const posterizationCheckbox = document.querySelector('#posterizationCheckbox');

//Create references for canvases
let originalImgXSize;
let originalImgYSize;
const originalOutputCanvas = document.createElement('canvas');
const originalCanvasContext = originalOutputCanvas.getContext('2d')
const pixelizedCanvas = document.createElement('canvas');
const pixelizedCanvasContext = pixelizedCanvas.getContext('2d');
const editedOutputCanvas = document.createElement('canvas');
const editedCanvasContext = editedOutputCanvas.getContext('2d', {
    willReadFrequently: true
});
let loadedImage;

//Upload image. Uploaded image is saved to originalOutputCanvas
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const imageInput = document.getElementById('imageInput');
    const imageFile = imageInput.files[0];
    const imageSource = URL.createObjectURL(imageFile);
    loadedImage = new Image();
    loadedImage.src = imageSource;
    loadedImage.onload = () => {
        originalImgXSize = loadedImage.naturalWidth;
        originalImgYSize = loadedImage.naturalHeight;
        originalOutputCanvas.width = originalImgXSize;
        originalOutputCanvas.height = originalImgYSize;
        originalCanvasContext.imageSmoothingEnabled = false;
        originalCanvasContext.drawImage(loadedImage, 0, 0);
        output.innerHTML = '';
        output.appendChild(originalOutputCanvas);
    }
})

pixelateFactorSlider.addEventListener('input', (event) => {
    updateImage();
})

posterizationSlider.addEventListener('input', (event) => {
    updateImage();
})

posterizationCheckbox.addEventListener('input', (event) => {
    updateImage();
})

//Pixelate image. The temporary canvas that is resized is editedOutputCanvas in order to preserve the orignal image.
function pixelizeImage() {
    let pixelateValue;
    let newImgXSize;
    let newImgYSize;
    pixelateValue = pixelateFactorSlider.value;
    newImgXSize = originalImgXSize / pixelateValue;
    newImgYSize = originalImgYSize / pixelateValue;
    editedOutputCanvas.width = newImgXSize;
    editedOutputCanvas.height = newImgYSize
    editedCanvasContext.imageSmoothingEnabled = false;
    editedCanvasContext.drawImage(loadedImage, 0, 0, newImgXSize, newImgYSize);
    pixelizedCanvas.width = originalImgXSize;
    pixelizedCanvas.height = originalImgYSize;
    pixelizedCanvasContext.imageSmoothingEnabled = false;
    pixelizedCanvasContext.drawImage(editedOutputCanvas, 0, 0, originalImgXSize, originalImgYSize); //Is this the problem?
    output.innerHTML = '';
    output.appendChild(pixelizedCanvas);
}

//Posterize the pixelizedCanvas
function posterizeImage() {
    const posterizeAmount = posterizationSlider.value;
    editedOutputCanvas.width = originalImgXSize;
    editedOutputCanvas.height = originalImgYSize;
    editedCanvasContext.imageSmoothingEnabled = false;
    editedCanvasContext.drawImage(pixelizedCanvas, 0, 0, originalImgXSize, originalImgYSize);
    
    const imageData = editedCanvasContext.getImageData(
        0, 0, originalImgXSize, originalImgYSize
    );

    for (let i = 0; i < imageData.data.length; i+=4) {
        let red = imageData.data[i];
        let green = imageData.data[i+1];
        let blue = imageData.data[i+2];
        let color = red / 255;
        color = color * posterizeAmount;
        color = Math.floor(color);
        color = color / posterizeAmount;
        color = color * 255;
        red = color;
        imageData.data[i] = red;
        
        color = green / 255;
        color = color * posterizeAmount;
        color = Math.floor(color)
        color = color / posterizeAmount;
        color = color * 255;
        green = color;
        imageData.data[i+1] = green;

        color = blue;
        color = color / 255;
        color = color * posterizeAmount;
        color = Math.floor(color)
        color = color / posterizeAmount;
        color = color * 255;
        blue = color;
        imageData.data[i+2] = blue;
    }    
    
    editedCanvasContext.putImageData(imageData, 0, 0);
    
    output.innerHTML = '';
    output.appendChild(editedOutputCanvas);
}

function updateImage() {
    pixelizeImage();
    if (posterizationCheckbox.checked) {
        posterizeImage();
        console.log("posterize");
    }
}