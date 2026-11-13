import './style.css';

const uploadButton = document.querySelector('#uploadButton');
const outputPreview = document.querySelector('#outputPreview')
const uploadForm = document.querySelector('#imageUploadForm');
const pixelateFactorSlider = document.querySelector('#pixelateFactorSlider');
const pixelateButton = document.querySelector('#pixelateButton');
const output = document.querySelector("#output");

uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const imageInput = document.getElementById('imageInput');
    const imageFile = imageInput.files[0];
    const imageSource = URL.createObjectURL(imageFile);
    const loadedImage = new Image();
    loadedImage.src = imageSource;
    let imgxsize;
    let imgysize;
    loadedImage.onload = () => {
        imgxsize = loadedImage.naturalWidth;
        imgysize = loadedImage.naturalHeight;
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = imgxsize;
        outputCanvas.height = imgysize;
        const canvasContext = outputCanvas.getContext('2d')
        canvasContext.drawImage(loadedImage, 0, 0);
        output.innerHTML = '';
        canvasContext.imageSmoothingEnabled = false;
        output.appendChild(outputCanvas);
    }
})

pixelateFactorSlider.addEventListener('input', (event) => {
    let pixelateValue;
    let newimgxsize;
    let newimgysize;
    pixelateValue = pixelateFactorSlider.value;
    

})