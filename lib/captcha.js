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

        let startX = 0;
        while(counter[startX] == 0){
            ++startX;
        }

        //TESTING
        console.log(counter.slice(startX, startX+50).toString());
        //TETING

        let result = '';
        for(let i = 0; i < 7; ++i) {
            let letter = recognizeLetter(counter, startX);
            startX += letter.code.length + letter.dx;
            result += letter.char;
        }

        console.log('Captcha solution: ' + result);
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
    let counter = new Array(gray.length).fill(0);

    for(let x = 0; x < gray.length; ++x) {
        let len = 0;
        const def_lives = 2;
        let lives = def_lives;
        for(let y = 0; y < gray[x].length; ++y) {
            if(gray[x][y] != bg) {
                len += 1 + (def_lives - lives);
                lives = def_lives;
            }
            else if(lives > 0 && len > 0) {
                --lives;
            }
            else {
                len = 0;
                lives = def_lives;
            }

            if(len > counter[x]) {
                counter[x] = len;
            }
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

    for(let x = 0; x < data.length; ++x) {
        for(let y = 0; y < data[x].length; ++y) {
            if (isToReverse(x, y, {top, mid, bot}, {upper, lower})) {
                data[x][y] = 255 - data[x][y];
            }
        }
    }

    return data;
}

function isToReverse(x, y, points, funs) {

    const top = points.top;
    const mid = points.mid;
    const bot = points.bot;

    const upper = funs.upper;
    const lower = funs.lower;

    if(top.x == mid.x && mid.x == bot.x) {
        return x < mid.x;
    }

    if(y < mid.y) {
        //upper
        if(top.x < mid.x) {
            return y <= calcLinearFun(upper, x);
        }
        else if(top.x > mid.x) {
            return y >= calcLinearFun(upper, x);
        }
        else {
            return (bot.x > mid.x ? x > mid.x : x < mid.x);
        }
    }
    else {
        //lower
        if(bot.x < mid.x) {
            return y >= calcLinearFun(lower, x);
        }
        else if(bot.x > mid.x) {
            return y <= calcLinearFun(lower, x);
        }
        else {
            return (top.x > mid.x ? x > mid.x : x < mid.x);
        }
    }
}

function calcLinearFun(f, x) {
    return (f.a*x + f.b);
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

function recognizeLetter(data, start) {
    const patterns = getPatterns();
    const ampX = 5;
    let bestDiff = Infinity;
    let bestChar = undefined;

    for(let dx = -ampX; dx <= ampX; ++dx) {
        if(start+dx < 0)
            continue;
        let best_dx = undefined;
        let best_dx_score = Infinity;
        let best_dx_char = undefined;
        for(const char of patterns) {
            if(char.code.length == 0)
                continue;

            const diff = charPatternAssess(data, start, dx, char.code);

            if(diff < best_dx_score) {
                best_dx = dx;
                best_dx_score = diff;
                best_dx_char = char;
            }
        }

        if(best_dx_score < bestDiff) {
            bestChar = best_dx_char;
            bestDiff = best_dx_score;
            bestChar.dx = best_dx;
        }
    }

    return bestChar;
}

function charPatternAssess(data, start, dx, pattern) {
    const width = Math.min(pattern.length, data.length-start);
    let diff = 0;
    start += dx;
    const edge = width + start;
    for(let x = start; x < edge; ++x) {
        diff += Math.abs(pattern[x-start] - data[x]);
    }
    return diff/width;
}

function getPatterns() {
    return [
        {char: 'a', code: [15,16,16,16,42,42,42,42,42,42,48,48,48,48,48,48,48,42,42,42,42,42,42,42,42,42,44,46,48,50,51,51,49,47,45,44,42,42,42,42,42,42,41,33,33,36,37,37,37,33]},
        {char: 'b', code: []},
        {char: 'c', code: [14,16,16,41,42,42,47,48,48,48,48,48,48,48,48,48,48,48,47,36,36,36,36,36,36,36,36,36,36,36,40,41,41,40,36,36,39,40,39,36,36,36,36,36,38,36,34,32,30,29]},
        {char: 'd', code: [23,23,23,30,30,30,30,47,47,47,47,47,47,36,36,36,39,39,38,36,36,36,36,48,48,48,48,48,48,36,36,36,36,55,55,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56]},
        {char: 'e', code: [9,11,11,47,47,47,47,47,47,47,47,47,47,47,47,47,47,45,44,47,48,45,43,40,37,36,36,36,36,36,43,43,43,43,43,43,43,43,43,43,36,36,36,36,36,29,29,29,29,33]},
        {char: 'f', code: []},
        {char: 'g', code: [42,42,43,45,48,50,55,55,55,49,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,61,61,61,56,55,55,55,55,55,55]},
        {char: 'h', code: [17,19,19,50,50,49,50,53,53,53,53,53,53,49,50,50,49,50,49,50,37,36,37,36,37,37,36,55,56,56,56,56,56,56,56,56,56,55,56,59,59,59,56,56,59,59,59,55,56,55]},
        {char: 'i', code: [26,26,26,55,55,55,55,55,55,55,55,55,55,55,56,56,55,55,55,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,58,61,61,61,51,51,51,51,51,50]},
        {char: 'j', code: [6,10,10,11,33,55,55,55,60,60,60,55,55,43,43,43,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62]},
        {char: 'k', code: [18,18,18,43,56,56,56,56,56,56,56,56,56,27,56,56,27,56,56,55,38,38,38,38,45,45,45,45,45,48,48,48,45,45,45,45,45,45,49,49,49,49,49,49,45,45,45,40,38,38]},
        {char: 'l', code: []},
        {char: 'm', code: []},
        {char: 'n', code: [1,23,22,24,27,25,4,4,30,16,27,37,7,13,31,8,10,37,37,26,37,16,9,9,13,13,13,17,12,20,37,6,7,31,13,11,32,14,18,31,26,14,27,44,42,42,42,42,42,42]},
        {char: 'p', code: [19,19,19,44,44,44,44,44,44,44,44,44,44,44,47,47,47,44,44,44,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,43,43,48,51,53]},
        {char: 'q', code: []},
        {char: 'r', code: [16,16,17,42,42,42,42,42,42,42,42,42,42,47,47,47,42,42,42,36,36,36,36,36,36,36,36,36,36,41,41,41,41,36,36,36,36,36,24,19,55,55,55,55,55,55,27,55,55,27]},
        {char: 's', code: []},
        {char: 't', code: []},
        {char: 'u', code: []},
        {char: 'v', code: []},
        {char: 'w', code: []},
        {char: 'x', code: [8,8,8,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,35,35,35,35,35,35,35,47,47,47,35,35,35,35,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42]},
        {char: 'y', code: [7,10,22,22,42,43,43,43,43,43,43,43,42,42,43,43,43,43,43,42,43,22,21,22,22,21,45,46,46,46,46,46,46,46,46,46,50,55,55,55,55,55,59,59,59,59,55,55,55,55]},
        {char: 'z', code: [8,8,9,35,35,35,35,35,35,35,35,41,42,42,42,42,42,42,42,42,42,42,42,42,42,35,35,35,35,35,35,35,35,35,46,45,45,45,45,45,35,35,35,35,42,42,42,35,35,35]},
        {char: '0', code: []},
        {char: '1', code: []},
        {char: '2', code: [9,9,10,10,55,55,55,55,55,55,55,55,55,55,53,55,58,55,52,52,52,52,52,58,58,58,58,58,58,58,58,58,58,53,49,49,49,55,55,55,55,56,56,55,55,56,58,58,56,56]},
        {char: '3', code: []},
        {char: '4', code: [55,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,55,37,37,37,37,37,37,37,37,37,38,48,48,48,48,37,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50]},
        {char: '5', code: []},
        {char: '6', code: []},
        {char: '7', code: [24,25,25,55,56,56,56,56,56,56,56,56,55,56,56,56,56,55,49,49,49,56,58,58,58,58,58,58,58,58,58,58,52,52,52,52,52,56,56,56,56,55,56,55,55,56,56,56,56,56]},
        {char: '8', code: []},
        {char: '9', code: [42,42,43,45,49,50,55,55,55,49,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,56,55,61,61,61,55,55,55,55,55,55,55]}
    ];
}