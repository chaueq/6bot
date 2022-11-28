function solveCaptcha() {
    let canvas = document.createElement('canvas');
    canvas.id = 'captcha-solver';
    // canvas.style = 'display: none;';
    try {
    canvas.style = 'z-index: 10000; width: 80vw;';
    const cover = document.getElementById('sd-cover');
    cover.parentNode.removeChild(cover);
    }catch(e){}
    canvas = document.body.appendChild(canvas);

    let img = new Image();
    img.src = document.getElementsByClassName('caper-image-holder')[0].src;

    img.addEventListener('load', function (e) {
        let img = e.target;
        let canvas = document.getElementById('captcha-solver');
        let ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        let gray = rgb2mono(imgData.data, canvas.width, canvas.height);

        const top = findInvertionTop(gray, 0);
        const mid = findInvertionTop(gray, 44);
        const bot = findInvertionTop(gray, 75);

        gray = reInvert(gray);

        for(let x = 0; x < gray.length; ++x) {
            for(let y = 0; y < gray[x].length; ++y) {
                for(let c = 0; c < 3; ++c) {
                    imgData.data[x*4 + canvas.width*y*4 + c] = gray[x][y];
                }
                imgData.data[x*4 + canvas.width*y*4 + 3] = 255;
            }
        }

        const counter = countBars(gray);

        mark(imgData, top, canvas.width);
        mark(imgData, mid, canvas.width);
        mark(imgData, bot, canvas.width);
        ctx.putImageData(imgData, 0, 0);

        for(let x = 0; x < counter.length; ++x) {
            if(counter[x] == 0) {
                continue;
            }
            let blob = [];
            for(let i = 0; i < 50; ++i) {
                if(x+i > counter.length)
                    break;
                blob.push(counter[x+i]);
            }
             //TESTING
                console.log(blob);
                break;
             //TESTING
        }
    });
}

function rgbToHsv( r, g, b ) {
    	
	var h;
	var s;
	var v;
     
	var maxColor = Math.max(r, g, b);
	var minColor = Math.min(r, g, b);
	var delta = maxColor - minColor;
    	
	// Calculate hue
	// To simplify the formula, we use 0-6 range.
	if(delta == 0) {
		h = 0;
	}
	else if(r == maxColor) {
		h = (6 + (g - b) / delta) % 6;
	}
	else if(g == maxColor) {
		h = 2 + (b - r) / delta;
	}
	else if(b == maxColor) {
		h = 4 + (r - g) / delta;
	}
	else {
		h = 0;
	}
	// Then adjust the range to be 0-1
	h = h/6;
	
	// Calculate saturation
	if(maxColor != 0) {
		s = delta / maxColor;
	}
	else {
		s = 0;
	}
	
	// Calculate value
	v = maxColor / 255;
	
	return { h: h, s: s, v: v };
};

function countBars(gray) {

    const bg = getBGcolor(gray);
    let counter = new Array(gray.length).fill(gray[0].length);

    for(let x = 0; x < gray.length; ++x) {
        for(let y = 0; y < gray[x].length; ++y) {
            if(gray[x][y] == bg)
                counter[x]--;
        }
    }

    return counter;
}

function rgb2mono(data, width, height) {
    const gray = Array.from({length: width}, () => new Array(height).fill(0));

    for(let x = 0; x < gray.length; ++x) {
        for(let y = 0; y < gray[x].length; ++y) {
            let v = rgbToHsv(data[x*4 + width*y*4 + 0], data[x*4 + width*y*4 + 1], data[x*4 + width*y*4 + 2]).v;
            gray[x][y] = (v > 0.5) * 255;
        }
    }

    return gray;
}

function findInvertionTop(data, y) {
    let maxDiff = 0;
    let d = 0;
    for(let b = 0; b < data.length-1; ++b) {
        let left = 0, right = 0;
        for(let x = 0; x < data.length; ++x) {
            const val = data[x][y] == 0 ? -1 : 1;
            if(x >= b)
                right += val;
            else
                left += val;
        }
        const diff = Math.abs(left - right);
        if(diff > maxDiff) {
            maxDiff = diff;
            d = b;
        }
    }
    return {x: d, y};
}

function reInvert(data) {

    const top = findInvertionTop(data, 0);
    const mid = findInvertionTop(data, 44);
    const bot = findInvertionTop(data, 75);

    console.log(top, mid, bot);

    const upper = {
        a: (mid.y - top.y) / (mid.x - top.x),
        b: undefined
    };
    upper.b = mid.y - upper.a*mid.x;
    const lower = {
        a: (mid.y - bot.y) / (mid.x - bot.x),
        b: undefined
    };
    lower.b = mid.y - lower.a*mid.x;

    console.log(upper, lower);

    for(let x = 0; x < data.length; ++x) {
        for(let y = 0; y < data[x].length; ++y) {
            if(y >= Math.round(upper.a*x + upper.b) && y <= Math.round(lower.a*x + lower.b))
                data[x][y] = 255 - data[x][y];
        }
    }

    return data;
}

function getBGcolor(data) {
    let black = 0, white = 0;
    data[0][0] == 0 ? ++black : ++white;
    data[0][data[0].length-1] == 0 ? ++black : ++white;
    data[data.length-1][0] == 0 ? ++black : ++white;
    data[data.length-1][data[data.length-1].length-1] == 0 ? ++black : ++white;
    return black > white ? 0 : 255;
}

function mark(imgData, point, width) {
    imgData.data[point.x*4 + width*point.y*4 + 0] = 0;
    imgData.data[point.x*4 + width*point.y*4 + 1] = 255;
    imgData.data[point.x*4 + width*point.y*4 + 2] = 0;
    imgData.data[point.x*4 + width*point.y*4 + 3] = 255;
}

function getPatterns() {
    [
        {char: 'a', code: [15,15,15,15,42,42,37,38,42,41,42,48,48,38,48,48,37,41,42,35,42,42,36,38,42,36,38,45,40,43,51,42,40,47,43,35,42,42,29,42,42,31,34,33,22,34,37,26,35,32]},
        {char: 'b', code: []},
        {char: 'c', code: [16,16,16,42,42,42,44,38,48,48,41,48,48,34,48,48,38,48,48,29,36,36,31,32,36,30,31,36,32,32,41,36,36,40,35,31,40,40,30,37,36,27,36,36,31,37,35,27,42,42]},
        {char: 'd', code: [23,24,24,30,30,30,23,38,47,47,36,47,47,43,36,36,35,39,38,31,36,36,32,47,48,43,44,48,44,39,36,30,30,56,53,51,56,56,40,56,56,39,56,56,41,56,56,41,54,56]},
        {char: 'e', code: [11,11,47,47,47,37,35,47,40,35,47,39,26,45,46,27,32,43,35,40,45,31,32,37,26,25,35,24,23,43,33,32,43,35,30,43,38,29,35,33,18,30,36,28,26,29,20,25,32,33]},
        {char: 'f', code: []},
        {char: 'g', code: [20,42,43,45,47,49,43,42,55,43,39,55,52,33,55,55,36,49,55,48,53,55,45,48,55,50,50,55,49,48,55,48,47,55,51,46,55,48,36,55,60,41,53,55,41,50,55,38,50,55]},
        {char: 'h', code: [18,19,19,50,50,50,40,33,53,52,34,53,53,27,50,50,29,50,50,47,37,37,34,34,37,35,35,55,54,54,56,53,50,56,55,54,56,56,39,59,59,43,56,56,49,59,59,45,52,56]},
        {char: 'i', code: []},
        {char: 'j', code: [5,10,10,11,33,55,52,54,60,53,54,55,48,41,43,37,55,62,52,40,62,54,40,62,62,43,60,62,46,61,62,62,61]},
        {char: 'k', code: [18,18,18,55,56,56,50,42,56,56,41,56,56,41,56,56,40,56,56,53,38,38,34,38,45,40,42,45,43,42,48,43,34,45,45,35,45,45,41,49,49,42,49,49,39,42,43,41,37,37]},
        {char: 'l', code: []},
        {char: 'm', code: [42,42,42,42,42,43,36,38,46,44,32,45,43,33,42,42,31,42,42,40,42,42,39,42,42,34,38,42,28,28,37,35,35,43,43,42,43,43,32,43,43,26,37,37,29,37,29,22,28,33]},
        {char: 'n', code: []},
        {char: 'p', code: [19,19,44,44,44,29,26,44,29,24,44,37,22,40,45,27,31,43,36,47,53,44,45,52,44,45,53,44,42,53,47,46,53,47,46,53,45,33,50,51,38,47,53,40,36,43,36,45]},
        {char: 'q', code: []},
        {char: 'r', code: [16,16,18,42,42,42,31,33,42,33,32,42,34,35,46,42,29,42,42,33,36,36,34,36,36,35,36,36,34,41,40,36,36,36,34]},
        {char: 's', code: []},
        {char: 't', code: []},
        {char: 'u', code: [18,21,22,42,42,42,38,34,42,40,31,42,42,30,42,42,34,42,42,47,48,50,50,51,50,39,40,42,41,21,21,19,19,48,48,47,48,48,37,48,48,37,48,48,35,48,48,37,48,48]},
        {char: 'v', code: []},
        {char: 'w', code: []},
        {char: 'x', code: [6,8,8,37,37,37,33,32,37,37,32,37,37,30,37,37,29,37,37,30,37,36,29,32,35,31,34,35,43,45,47,28,27,35,33,34,42,42,31,42,42,31,42,42,37,42,42,36,40,42]},
        {char: 'y', code: [8,9,22,22,43,43,38,37,43,40,37,43,43,31,43,43,30,42,43,36,43,22,17,17,22,18,41,46,41,42,46,39,39,46,43,41,52,54,38,55,55,38,58,59,46,55,55,38,48,55]},
        {char: 'z', code: [6,8,8,35,35,35,31,31,35,33,30,41,41,34,42,42,33,42,42,32,40,42,30,35,41,27,28,35,27,27,35,27,24,35,45,33,45,43,36,45,35,26,34,35,37,42,42,29,33,35]},
        {char: '0', code: []},
        {char: '1', code: []},
        {char: '2', code: [9,10,10,10,55,55,54,50,55,55,49,55,55,44,53,55,45,54,52,42,52,52,45,55,58,51,51,58,52,53,58,52,51,54,47,42,49,55,47,55,55,46,56,55,48,56,58,51,56,55]},
        {char: '3', code: []},
        {char: '4', code: [55,56,56,56,56,56,54,47,56,56,48,56,56,46,56,56,47,56,56,53,37,37,35,37,37,34,36,37,36,37,48,46,46,48,37,48,50,50,32,50,50,35,50,50,35,50,50,35,47,50]},
        {char: '5', code: []},
        {char: '6', code: []},
        {char: '7', code: []},
        {char: '8', code: [36,37,53,55,55,55,47,44,55,58,47,55,55,38,55,55,37,54,52,46,52,52,46,45,49,43,44,49,44,43,50,55,55,53,49,48,52,52,36,52,52,37,51,52,37,51,52,40]},
        {char: '9', code: [40,42,43,45,49,49,50,48,55,49,48,55,55,39,55,55,41,55,55,46,55,55,47,53,55,50,53,55,47,53,55,48,44,55,54,46,55,53,38,55,60,40,60,55,41,54,54,41,52,55]}
    ];
}