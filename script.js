import './style.css';

//Create references for inputs
const uploadButton = document.querySelector('#uploadButton');
const outputPreview = document.querySelector('#outputPreview')
const uploadForm = document.querySelector('#imageUploadForm');
const pixelateFactorSlider = document.querySelector('#pixelateFactorSlider');
const output = document.querySelector("#output");

//Create references for canvases
let originalImgXSize;
let originalImgYSize;
const originalOutputCanvas = document.createElement('canvas');
const originalCanvasContext = originalOutputCanvas.getContext('2d')
const finalOutputCanvas = document.createElement('canvas');
const finalCanvasContext = finalOutputCanvas.getContext('2d');
const editedOutputCanvas = document.createElement('canvas');
const editedCanvasContext = editedOutputCanvas.getContext('2d');
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

//Pixelate image. The temporary canvas that is resized is editedOutputCanvas in order to preserve the orignal image.
pixelateFactorSlider.addEventListener('input', (event) => {
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
    finalOutputCanvas.width = originalImgXSize;
    finalOutputCanvas.height = originalImgYSize;
    finalCanvasContext.imageSmoothingEnabled = false;
    finalCanvasContext.drawImage(editedOutputCanvas, 0, 0, originalImgXSize, originalImgYSize); //Is this the problem?
    output.innerHTML = '';
    output.appendChild(finalOutputCanvas);
})

//Posterize the finalOutputCanvas
