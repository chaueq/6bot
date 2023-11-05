async function getData(key) {
    const storage = chrome.storage.local;
    const result = await storage.get(key);
    const json = result[key];
    return JSON.parse(json);
}

function delData(key) {
    const storage = chrome.storage.local;
    return storage.remove(key);
}

async function setData(key, val) {
    const storage = chrome.storage.local;
    const json = JSON.stringify(val);
    const obj = {};
    obj[key] = json;
    return storage.set(obj);
}

function sendMessageToBackground(msg_type, content) {
    /*
        MESSAGE TYPES:
        1 - save conversation
        2 - remove conversation
        3 - move conversation from temporary to permanent
        4 - rename conversation
        5 - request filtering of history entires
    */

    chrome.runtime.sendMessage({
        type: msg_type,
        content
    });
}

function translateMsg(text, user, obcy) {
    const keywords = [
        {key: 'p', value: (user.sex == 1 ? 'm' : 'k')},
        {key: 'w', value: user.age.toString()},
        {key: 'z', value: (user.zb == 1 ? 'tak' : 'nie ')},
        {key: 'i', value: user.name},

        {key: '*', value: (user.name.length == 0 ? '$p' : '$i') + ' $w' + (user.zb == 1 && !obcy.told.zb ? ' zb' : '')},
    ];

    while(/([^\$]|^)\$[^\$]/g.test(text)) {
        if(obcy !== undefined) {
            if(obcy.told.sex) {
                text = text.replaceAll('$p', '').replaceAll(/ {2,}/g, ' ');
            }
            if(obcy.told.age) {
                text = text.replaceAll('$w', '').replaceAll(/ {2,}/g, ' ');
            }
            if(obcy.told.zb) {
                text = text.replaceAll('$z', '').replaceAll(/ {2,}/g, ' ');
            }
            if(obcy.told.name) {
                text = text.replaceAll('$i', '').replaceAll(/ {2,}/g, ' ');
            }

            obcy.told.sex = obcy.told.sex || text.includes('$p');
            obcy.told.age = obcy.told.age || text.includes('$w');
            obcy.told.zb = obcy.told.zb || text.includes('$z');
            obcy.told.name = obcy.told.name || text.includes('$i');
        }
        for(const k of keywords) {
            text = text.replaceAll('$'+k.key, k.value);
        }
    }

    return text.replaceAll('$$', '$');
}

function drawRandom(array) {
    return array[Math.max(Math.min(Math.floor(Math.random() * array.length), array.length-1), 0)];
}