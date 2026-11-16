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
const greyscaleSlider = document.querySelector('#greyscaleAmount');
const saturationSlider = document.querySelector('#saturationAmount');
const brightnessSlider = document.querySelector('#brightnessAmount');
const resetButton = document.querySelector('#resetButton');
const contrastSlider = document.querySelector('#contrastAmount');
const thresholdSlider = document.querySelector('#thresholdAmount');
const thresholdCheckbox = document.querySelector('#thresholdCheckbox');
const hueSlider = document.querySelector('#hueAmount');
const draggableElements = document.querySelectorAll('.effect')
const muteButton = document.querySelector('#muteButton');
const muteIcon = document.querySelector('#volumeMuteIcon');

//Create misc. variables
let loadedImage;
let imageData;
let currentHighestZIndex = 1;
let isMuted = false;

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
const blankCanvas = document.querySelector('#blank');

muteButton.addEventListener('click', (event) => {
    if (isMuted === true) {
        muteIcon.hidden = true;
        isMuted = false;
    }

    else {
        muteIcon.hidden = false;
        isMuted = true;
    }
})

//Resize the canvas so that things don't get to crazy with high resolution images.
function resizeImage(maxPixels = 20) {
    let currentPixelCount = originalImgXSize * originalImgYSize;
    if (maxPixels < currentPixelCount) {
        const scale = Math.sqrt(maxPixels / currentPixelCount);
    
        originalImgXSize = Math.round(originalImgXSize * scale);
        originalImgYSize = Math.round(originalImgYSize * scale);
    }
}

//Panel Dragging
draggableElements.forEach(element => {
    const handle = element.querySelector('.dragHeader');
    let isDragging = false;
    let hasBeenDragged = false;

    let startX, startY;
    let initialLeft, initialTop;
    let newLeft, newTop;

    handle.addEventListener('pointerdown', (event) => {
        const rect = element.getBoundingClientRect();

        startX = event.clientX;
        startY = event.clientY;
    
        initialLeft = rect.left;
        initialTop = rect.top;
        
        currentHighestZIndex++;
        element.style.zIndex = currentHighestZIndex;
        if (!hasBeenDragged) {
            hasBeenDragged = true;
            element.style.position = "fixed";
            element.style.left = `${initialLeft}px`;
            element.style.top = `${initialTop}px`;
            const placeholderDiv = document.createElement("div");
            element.parentElement.insertBefore(placeholderDiv, element);
            placeholderDiv.style.width = `${rect.width}px`;
            placeholderDiv.style.height = `${rect.height}`;
        }

        handle.setPointerCapture(event.pointerId);
        isDragging = true;
    });

    handle.addEventListener('pointermove', (event) => {
        if (isDragging) {
            newLeft = initialLeft + (event.clientX - startX);
            newTop = initialTop + (event.clientY - startY);
    
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
        }
    })

    handle.addEventListener('pointerup', (event) => {
        if (isDragging) {
            isDragging = false;
            updateImage();
        }
    })
})

//Play button sounds.
const hoverSound = new Audio('https://cdn.hackclub.com/01a1ddbb-5be0-7281-abac-8f5364e75aff/Hover.mp3');
const exportSound = new Audio('https://cdn.hackclub.com/01a1ddce-98b2-7959-9261-ab6a8f1dd36c/PartyBlower.mp3');
const clickSound = new Audio('https://cdn.hackclub.com/01a1ddbb-5b4a-7c03-ae07-1fcece919128/ButtonClick.mp3');
const tickSound = new Audio('https://cdn.hackclub.com/01a1e154-f71a-70ba-a2ec-129d089b5c00/tick.mp3');

const hoverButtons = document.querySelectorAll(".hoverSoundButton");

hoverButtons.forEach(button => {
    console.log("hovered and unmuted")
    button.addEventListener('mouseenter', () => {
        if (!isMuted) {
            hoverSound.currentTime = 0;
            hoverSound.play();
        }
    })
})

const clickButtons = document.querySelectorAll(".clickSoundButton");
clickButtons.forEach(button => {
    if (!isMuted) {
        button.addEventListener('click', () => {
            clickSound.currentTime = 0;
            clickSound.play();
        })
    }
})

const sliders = document.querySelectorAll('input[type="range"]');
sliders.forEach(slider => {
    slider.addEventListener('input', (event) => {
        if (!isMuted) {
            hoverSound.currentTime = 0;
            hoverSound.play();
        }
    })
})

sliders.forEach(slider => {
    slider.addEventListener('change', (event) => {
        updateImage();
    })
})

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
        resizeImage(777600);
        originalOutputCanvas.width = originalImgXSize;
        originalOutputCanvas.height = originalImgYSize;
        originalCanvasContext.imageSmoothingEnabled = true;
        originalCanvasContext.drawImage(loadedImage, 0, 0, originalImgXSize, originalImgYSize);
        output.innerHTML = '';
        output.appendChild(originalOutputCanvas);
        editedOutputCanvas.width = originalImgXSize;
        editedOutputCanvas.height = originalImgYSize;
        editedCanvasContext.imageSmoothingEnabled = false;
        editedCanvasContext.drawImage(originalOutputCanvas, 0, 0, originalImgXSize, originalImgYSize);
        updateImage();
    }
})

//Listen for a change on tint slider.
tintColor.addEventListener('change', (event) => {
    updateImage();
})

//Listen for changes on checkboxes.
const checkboxes = document.querySelectorAll('input[type=checkbox]');
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('input', (event) => {
        updateImage();
    })
})

//Export the image with applied effects.
exportButton.addEventListener('click', (event) => {
    exportSound.currentTime = 0;
    exportSound.play();
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = editedOutputCanvas.toDataURL();
    a.download = "Final-Output.png";
    a.click();
    document.body.removeChild(a);
    
})

//Pixelate image. The temporary canvas that is resized is editedOutputCanvas in order to preserve the orignal image.
function pixelizeImage() {
    let pixelateValue;
    let newImgXSize;
    let newImgYSize;
    pixelateValue = pixelateFactorSlider.value;
    newImgXSize = Math.round(originalImgXSize / pixelateValue);
    newImgYSize = Math.round(originalImgYSize / pixelateValue);
    editedCanvasContext.putImageData(imageData, 0, 0);
    workingCanvas.width = newImgXSize;
    workingCanvas.height = newImgYSize;
    workingCanvasContext.imageSmoothingEnabled = true;
    workingCanvasContext.drawImage(editedOutputCanvas, 0, 0, newImgXSize, newImgYSize);
    
    editedOutputCanvas.width = originalImgXSize;
    editedOutputCanvas.height = originalImgYSize;
    editedCanvasContext.imageSmoothingEnabled = false;
    editedCanvasContext.drawImage(workingCanvas, 0, 0, originalImgXSize, originalImgYSize);
    workingCanvas.width = originalImgXSize;
    workingCanvas.height = originalImgYSize;
    workingCanvasContext.imageSmoothingEnabled = false;
    workingCanvasContext.drawImage(editedOutputCanvas, 0, 0, originalImgXSize, originalImgYSize);
    imageData = workingCanvasContext.getImageData(0, 0, originalImgXSize, originalImgYSize);
}

//Posterize the image.
function posterizeImage() {
    const posterizeAmount = posterizationSlider.value;

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
}

//Tint the image with the selected color.
function tintImage() {
    const imageTint = tintColor.value;
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
}

//Greyscale the image by a factor of the greyscale slider.
function greyscaleImage() {
    let greyscaleAmount = greyscaleSlider.value;
    for (let i = 0; i < imageData.data.length; i+=4) {
        let red = imageData.data[i];
        let green = imageData.data[i+1];
        let blue = imageData.data[i+2];
        const grey = red * 0.2126 + green * 0.7152 + blue * 0.0722;
        red =  red * (1 - greyscaleAmount) + grey * greyscaleAmount;
        green = green * (1 - greyscaleAmount) + grey * greyscaleAmount;
        blue = blue * (1 - greyscaleAmount) + grey * greyscaleAmount;
        imageData.data[i] = red;
        imageData.data[i+1] = green;
        imageData.data[i+2] = blue;
    }
}

//Saturate image, in other words, put the color further away from grey.
function saturateImage() {
    let saturationAmount = saturationSlider.value;    
    
    for (let i = 0; i < imageData.data.length; i+=4) {
        //Satuaration pushes pixels' colors closer or further away from their greyscale amount, so grey needs to be calcuated.
        let red = imageData.data[i];
        let green = imageData.data[i+1];
        let blue = imageData.data[i+2];
        const grey = red * 0.2126 + green * 0.7152 + blue * 0.0722;
        red = grey + (red - grey) * saturationAmount;
        green = grey + (green - grey) * saturationAmount;
        blue = grey + (blue - grey) * saturationAmount; 
        
        //red = Math.max(0, Math.min(255, red));
        //green = Math.max(0, Math.min(255, green));
        //blue = Math.max(0, Math.min(255, green));

        imageData.data[i] = red;
        imageData.data[i+1] = green;
        imageData.data[i+2] = blue;
    }
}

//Apply brightness by adjusting midtones to avoid blowing out light and dark areas.
function brightenImage() {
    let brightnessAmount = brightnessSlider.value;
    for (let i = 0; i < imageData.data.length; i+=4) {
        let red = imageData.data[i];
        let green = imageData.data[i+1];
        let blue = imageData.data[i+2];

        red = 255 * (red / 255) ** (1 / brightnessAmount);
        green = 255 * (green / 255) ** (1 / brightnessAmount);
        blue = 255 * (blue / 255) ** (1 / brightnessAmount);

        imageData.data[i] = red;
        imageData.data[i+1] = green;
        imageData.data[i+2] = blue;
    }
}

//Apply contrast by increasing the distance between light and dark pixels.
function contrastImage() {
    let contrastAmount = contrastSlider.value;
    contrastAmount = (contrastAmount - 1) * 255;
    let contrastMultiplier = (259 * (contrastAmount + 255)) / (255 * (259 - contrastAmount));
    for (let i = 0; i < imageData.data.length; i+=4) {
        let red = imageData.data[i];
        let green = imageData.data[i+1];
        let blue = imageData.data[i+2];

        red = Math.trunc(contrastMultiplier * (red - 128) + 128);
        green = Math.trunc(contrastMultiplier * (green - 128) + 128);
        blue = Math.trunc(contrastMultiplier * (blue - 128) + 128);

        imageData.data[i] = red;
        imageData.data[i+1] = green;
        imageData.data[i+2] = blue;
    }
}

//Apply threshold by comparing pixel values to luminence.
function thresholdImage() {
    let thresholdValue = thresholdSlider.value;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        let red = imageData.data[i];
        let green = imageData.data[i+1];
        let blue = imageData.data[i+2];

        let luminance = (.299 * red) + (.587 * green) + (.114 * blue);
        
        if (luminance >= thresholdValue) {
            red = 255;
            green = 255;
            blue = 255;
        }

        else {
            red = 0;
            green = 0;
            blue = 0;
        }

        imageData.data[i] = red;
        imageData.data[i+1] = green;
        imageData.data[i+2] = blue;
    }
}

//These following two functions were created by ChatGPT because they're way out of my league of understanding as I have no idea how to convert colors.
function RGBToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);

    let h, s;
    let l = (max + min) / 2;

    let difference = max - min;

    if (difference === 0 ) {
        h = 0;
        s = 0;
    }

    else {
        s = difference / (1 - Math.abs(2 * l - 1));

        if (max === r) {
            h = 60 * (((g - b) / difference) % 6);
        } else if (max === g) {
            h = 60 * ((b - r) / difference + 2);
        } else {
            h = 60 * ((r - g) / difference + 4);
        }
    }

    if (h < 0) h += 360;

    return [h, s, l];
}

function HSLToRGB(h, s, l) {
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;

    let r, g, b;

    if (h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (h < 180) {
        [r, g, b] = [0, c, x];
    } else if (h < 240) {
        [r, g, b] = [0, x, c];
    } else if (h < 300) {
        [r, g, b] = [x, 0, c];
    } else {
        [r, g, b] = [c, 0, x];
    }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function hueImage() {
    let hueAmount = Number(hueSlider.value);

    for (let i = 0; i < imageData.data.length; i += 4) {
        let red = imageData.data[i];
        let green = imageData.data[i+1];
        let blue = imageData.data[i+2];

        let [h, s, l] = RGBToHSL(red, green, blue);
        h = (h + hueAmount) % 360;

        let [newRed, newGreen, newBlue] = HSLToRGB(h, s, l);
        imageData.data[i] = newRed;
        imageData.data[i+1] = newGreen;
        imageData.data[i+2] = newBlue;
    }
}

//Function that actually applies image effects.
function updateImage() {
    editedOutputCanvas.width = originalImgXSize;
    editedOutputCanvas.height = originalImgYSize;
    editedCanvasContext.imageSmoothingEnabled = false;
    editedCanvasContext.drawImage(originalOutputCanvas, 0, 0, originalImgXSize, originalImgYSize);
    output.innerHTML = '';
    output.appendChild(editedOutputCanvas);
    imageData = editedCanvasContext.getImageData(0, 0, originalImgXSize, originalImgYSize);
    
    //Get the panels from top to bottom
    const panels = Array.from(document.querySelectorAll('.effect'));
    panels.sort((a, b) => {
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
    });

    panels.forEach(panel => {
        if (panel.id === 'pixelateEffect') {
            pixelizeImage();
        }

        else if (panel.id === 'posterizationEffect') {
            if (posterizationCheckbox.checked) {
                posterizeImage();
            }
        }

        else if (panel.id === 'tintEffect') {
            tintImage();
        }

        else if (panel.id === 'greyscaleEffect') {
            greyscaleImage();
        }

        else if (panel.id === 'saturationEffect') {
            saturateImage();
        }

        else if (panel.id === 'brightnessEffect') {
            brightenImage();
        }

        else if (panel.id === 'contrastEffect') {
            contrastImage();
        }

        else if (panel.id === 'thresholdEffect') {
            if (thresholdCheckbox.checked)
            thresholdImage();
        }

        else if (panel.id === 'hueEffect') {
            hueImage();
        }
    })
    
    editedCanvasContext.putImageData(imageData, 0, 0);
    output.innerHTML = '';
    output.appendChild(editedOutputCanvas);
}

//Reset button events
resetButton.addEventListener('click', (event) => {
    pixelateFactorSlider.value = 1;
    pixelateFactorSlider.dispatchEvent(new Event('input'));
    
    posterizationSlider.value = 10;
    posterizationSlider.dispatchEvent(new Event('input'));
    posterizationCheckbox.checked = false;

    tintColor.value = "#FFFFFF";

    greyscaleSlider.value = 0;
    greyscaleSlider.dispatchEvent(new Event('input'));

    saturationSlider.value = 1;
    saturationSlider.dispatchEvent(new Event('input'));

    brightnessSlider.value = 1;
    brightnessSlider.dispatchEvent(new Event('input'));

    contrastSlider.value = 1;
    contrastSlider.dispatchEvent(new Event('input'));

    thresholdSlider.value = 128;
    thresholdSlider.dispatchEvent(new Event('input'));

    thresholdCheckbox.checked = false;

    hueSlider.value = 0;
    hueSlider.dispatchEvent(new Event('input'));

    updateImage();
})