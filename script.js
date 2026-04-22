const logos = []
const closers = []
function elementsOverlap(el1, el2) {
   function isTouching(elem1, elem2) {
    // SAFETY GUARD: If these are the exact same HTML element, ignore them.
    if (elem1 === elem2) return false;

    const r1 = elem1.getBoundingClientRect();
    const r2 = elem2.getBoundingClientRect();

    return !(
        r1.top > r2.bottom ||
        r1.right < r2.left ||
        r1.bottom < r2.top ||
        r1.left > r2.right
    );

}
return isTouching(el1, el2)
}

function addLogo() {
// helper functions
function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function move(image, x, y) {
    image.style.left = x;
    image.style.top = y;
}

function getDimensions(image) {
    // get the dimensions from the width and height attributes
    let width = image.getAttribute("width");
    let height = image.getAttribute("height");

    if (width != null && height != null) {
        return [parseInt(width), parseInt(height)];
    }

    // get the dimensions from the viewbox if the width and height are not set
    let viewbox = image.getAttribute("viewBox");

    if (viewbox == null) {
        return [300, 150]; // default dimensions for SVG
    }

    viewbox = viewbox.split(" ");

    width = parseInt(viewbox[2]);
    height = parseInt(viewbox[3]);

    return [width, height];
}

function changeDirection(index, value) {
    direction[index] = value;

    // check if color randomization is enabled and if the direction changed
    if (randomizeColor) {
        logo.style.fill = `rgb(${randint(0, 255)}, ${randint(0, 255)}, ${randint(0, 255)})`;
    }
}

function getLogoURL() {
    // return the default logo if the parameter is not set
    if (!params.has("logo")) {
        return "/logos/default.svg"
    }
    
    return params.get("logo");
}

function getLogo(url) {
    // get the SVG logo from the URL
    const request = new XMLHttpRequest();
    const parser = new DOMParser();
    
    request.open("GET", url, false);
    request.send(null);
    
    // if the request failed, return the default logo
    if (request.status != 200) {
        return getLogo("/logos/default.svg");
    }
    
    let image = parser.parseFromString(request.responseText, "text/html");

    // if the image is not an SVG, return the default logo
    if (image.querySelector("parsererror")) {
        return getLogo("/logos/default.svg");
    }
    
    image = image.querySelector("svg");

    // if the image is null, return the default logo
    if (image == null) {
        return getLogo("/logos/default.svg");
    }
    
    // filter any color attributes from the SVG
    for (const attribute of ["fill", "style"]) {
        for (const element of image.querySelectorAll(`[${attribute}]`)) {
            element.removeAttribute(attribute);
        }
    }

    return image;
}

// constants
const params = new URLSearchParams(window.location.search);

const logo = getLogo(getLogoURL());
const dimensions = getDimensions(logo);

const initialColor = params.get("initialColor") || "white";
let randomizeColor = true;

// don't randomize the color if the parameter is set to false
if (params.has("randomizeColor") && params.get("randomizeColor") in ["false", "0"]) {
    randomizeColor = false;
}

let speed = document.querySelector("#speed").value;

// variables
let x = randint(1, window.innerWidth - dimensions[0] - 1);
let y = randint(1, window.innerHeight - dimensions[1] - 1);

let direction = [1, 1];

// set the ID and the fill color to the logo
logo.classList.add("logo");
logo.style.fill = initialColor;

// add the logo to the page
document.body.append(logo);

logos.push(logo) // add the logo to the array of logos

// move the logo to the randomized initial position
move(logo, x, y);

// main loop
var interavl = () => {
    speed = document.querySelector("#speed").value
    // change the coords based on the direction & speed
    x += speed * direction[0];
    y += speed * direction[1];
    
    // checkTouchingAnyOtherLogos()


    
    logos.forEach(secondLogo => {
    if (logo === secondLogo) return;

    if (elementsOverlap(logo, secondLogo)) {
        // Get the coordinates of the other logo
        // Note: You'd ideally store x/y in an object for each logo, 
        // but we can grab them from the rect for now
        const r1 = logo.getBoundingClientRect();
        const r2 = secondLogo.getBoundingClientRect();

        // 1. COLLISION ON X-AXIS (Horizontal)
        // If logo is on the left and moving right, OR on the right and moving left
        if ((r1.left < r2.left && direction[0] > 0) || (r1.left > r2.left && direction[0] < 0)) {
            changeDirection(0, -direction[0]); // Reverse X
        }

        // 2. COLLISION ON Y-AXIS (Vertical)
        if ((r1.top < r2.top && direction[1] > 0) || (r1.top > r2.top && direction[1] < 0)) {
            changeDirection(1, -direction[1]); // Reverse Y
        }
    }
});

    // check if logo is bouncing on the left/right side
    if (x <= 1) {
        changeDirection(0, 1);
    } else if (x + dimensions[0] + 1 >= window.innerWidth) {
        changeDirection(0, -1);
    }
    
    // check if logo is bouncing on the top/bottom side
    if (y <= 1) {
        changeDirection(1, 1);
    } else if (y + dimensions[1] + 1 >= window.innerHeight) {
        changeDirection(1, -1);
    }

    // move the logo to the current X and Y coords
    move(logo, x, y);
};
setInterval(interavl)
closers.push(() => clearInterval(interavl))
}

addLogo()
addLogo()

document.getElementById("settings").onclick = addLogo
document.getElementById("clear").onclick = function() {
    closers.forEach(c => {
        c()
    })
    logos.forEach(l => {
        l.remove()
    })
}