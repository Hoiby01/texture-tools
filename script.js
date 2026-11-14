import './style.css';

//Create references for inputs
const uploadButton = document.querySelector('#uploadButton');
const outputPreview = document.querySelector('#outputPreview')
const uploadForm = document.querySelector('#imageUploadForm');
const pixelateFactorSlider = document.querySelector('#pixelateFactorSlider');
const output = document.querySelector("#output");
const posterizationSlider = document.querySelector('#posterizationSlider');
const posterizationCheckbox = document.querySelector('#posterizationCheckbox');
const exportButton = document.querySelector('#exportButton');
const exportImage = document.querySelector('#exportImage');
const tintColor = document.querySelector('#tintColor');

//Create references for canvases
let originalImgXSize;
let originalImgYSize;
const originalOutputCanvas = document.createElement('canvas');
const originalCanvasContext = originalOutputCanvas.getContext('2d')
const workingCanvas = document.createElement('canvas');
const workingCanvasContext = workingCanvas.getContext('2d', {
    willReadFrequently: true
});
const editedOutputCanvas = document.createElement('canvas');
const editedCanvasContext = editedOutputCanvas.getContext('2d', {
    willReadFrequently: true
});
const blankCanvas = document.querySelector('blank');
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
        editedOutputCanvas.width = originalImgXSize;
        editedOutputCanvas.height = originalImgYSize;
        editedCanvasContext.imageSmoothingEnabled = false;
        editedCanvasContext.drawImage(workingCanvas, 0, 0, originalImgXSize, originalImgYSize);
        updateImage();
    }
})

//Listen for a change on pixelation slider
pixelateFactorSlider.addEventListener('change', (event) => {
    updateImage();
})

//Listen for a change on posterization slider
posterizationSlider.addEventListener('change', (event) => {
    updateImage();
})

//Listen for a change on posteriation checkbox
posterizationCheckbox.addEventListener('input', (event) => {
    updateImage();
})

exportButton.addEventListener('click', (event) => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = editedOutputCanvas.toDataURL();
    a.download = "Final-Output.png";
    a.click();
    document.body.removeChild(a);

})

tintColor.addEventListener('change', (event) => {
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
    workingCanvas.width = newImgXSize;
    workingCanvas.height = newImgYSize
    workingCanvasContext.imageSmoothingEnabled = false;
    workingCanvasContext.drawImage(editedOutputCanvas, 0, 0, newImgXSize, newImgYSize);
    
    editedOutputCanvas.width = originalImgXSize;
    editedOutputCanvas.height = originalImgYSize;
    editedCanvasContext.imageSmoothingEnabled = false;
    editedCanvasContext.drawImage(workingCanvas, 0, 0, originalImgXSize, originalImgYSize);
    output.innerHTML = '';
    output.appendChild(editedOutputCanvas);
}

//Posterize the workingCanvas
function posterizeImage() {
    const posterizeAmount = posterizationSlider.value;
    workingCanvas.width = originalImgXSize;
    workingCanvas.height = originalImgYSize;
    workingCanvasContext.imageSmoothingEnabled = false;
    workingCanvasContext.drawImage(editedOutputCanvas, 0, 0, originalImgXSize, originalImgYSize);
    
    const imageData = workingCanvasContext.getImageData(
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
    
    workingCanvasContext.putImageData(imageData, 0, 0);
    
    editedOutputCanvas.width = originalImgXSize;
    editedOutputCanvas.height = originalImgYSize;
    editedCanvasContext.imageSmoothingEnabled = false;
    editedCanvasContext.drawImage(workingCanvas, 0, 0, originalImgXSize, originalImgYSize);
    output.innerHTML = '';
    output.appendChild(editedOutputCanvas);
}

function tintImage() {
    const imageTint = tintColor.value;
    workingCanvas.width = originalImgXSize;
    workingCanvas.height = originalImgYSize;
    workingCanvasContext.imageSmoothingEnabled = false;
    workingCanvasContext.drawImage(editedOutputCanvas, 0, 0, originalImgXSize, originalImgYSize);
    const imageData = workingCanvasContext.getImageData(0, 0, originalImgXSize, originalImgYSize);
    const rTint = parseInt(imageTint.slice(1, 3), 16);
    const gTint = parseInt(imageTint.slice(3, 5), 16);
    const bTint = parseInt(imageTint.slice(5, 7), 16);

    for (let i = 0; i < imageData.data.length; i+=4) {
        let red = imageData.data[i];
        let green = imageData.data[i+1];
        let blue = imageData.data[i+2];

        red = (red * rTint) / 255;
        green = (green * gTint) / 255;
        blue = (blue * bTint) / 255;

        imageData.data[i] = red;
        imageData.data[i+1] = green;
        imageData.data[i+2] = blue;
    }

    workingCanvasContext.putImageData(imageData, 0, 0);

    editedOutputCanvas.width = originalImgXSize;
    editedOutputCanvas.height = originalImgYSize;
    editedCanvasContext.imageSmoothingEnabled = false;
    editedCanvasContext.drawImage(workingCanvas, 0, 0, originalImgXSize, originalImgYSize);
    output.innerHTML = '';
    output.appendChild(editedOutputCanvas);
}

//Function that actually applies image effects.
function updateImage() {
    editedOutputCanvas.width = originalImgXSize;
    editedOutputCanvas.height = originalImgYSize;
    editedCanvasContext.imageSmoothingEnabled = false;
    editedCanvasContext.drawImage(originalOutputCanvas, 0, 0, originalImgXSize, originalImgYSize);
    output.innerHTML = '';
    output.appendChild(editedOutputCanvas);
    
    pixelizeImage();
    if (posterizationCheckbox.checked) {
        posterizeImage();
    }
    tintImage();
}