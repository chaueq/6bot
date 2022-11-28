async function getData(key) {
    const result = await chrome.storage.sync.get(key);
    const json = result[key];
    return JSON.parse(json);
}

async function setData(key, val) {
    const json = JSON.stringify(val);
    const obj = {};
    obj[key] = json;
    return chrome.storage.sync.set(obj);
}

function translateMsg(text, user) {
    const keywords = [
        {key: '*', value: (user.name.length == 0 ? '$p' : '$i') + ' $w' + (user.zb == 1 ? ' zb' : '')},
        {key: 'p', value: (user.sex == 1 ? 'm' : 'k')},
        {key: 'w', value: user.age.toString()},
        {key: 'z', value: (user.zb == 1 ? 'tak' : 'nie ')},
        {key: 'i', value: user.name},
    ];

    while(/([^\$]|^)\$[^\$]/g.test(text)) {
        for(const k of keywords) {
            text = text.replaceAll('$'+k.key, k.value);
        }
    }

    return text.replaceAll('$$', '$');
}

function drawRandom(array) {
    return array[Math.max(Math.min(Math.floor(Math.random() * array.length), array.length-1), 0)];
}