async function saveSettings() {
    const settings = {
        user: {
            sex: document.getElementById('u_sex').value,
            age: document.getElementById('u_age').value,
            zb: document.getElementById('u_zb').value,
            name: document.getElementById('u_name').value
        },
        search: {
            sex: document.getElementById('o_sex').value,
            age: {
                min: document.getElementById('o_age_min').value,
                max: document.getElementById('o_age_max').value
            },
            zb: document.getElementById('o_zb').value
        },
        convo: {
            greeting: document.getElementById('c_greeting').value,
            final_msg: document.getElementById('c_final').value,
            disconnect: document.getElementById('c_disconnect').value == "1",
            feedback: document.getElementById('c_feedback').value == "1",
            typing_delay: document.getElementById('c_delay').value,
            reaction_time: document.getElementById('c_reactionTime').value,
            timeout: document.getElementById('c_timeout').value
        },
        captcha: {
            tries_limit: document.getElementById('captcha_tries').value
        }
    }
    console.log(settings);
    return setData('prefs', settings);
}

async function getSettings() {
    const def = {
        user: {
            sex: 0,
            age: 18,
            zb: true,
            name: ''
        },
        search: {
            sex: 0.5,
            age: {
                min: 18,
                max: 100
            },
            zb: 0.5
        },
        convo: {
            greeting: '$p',
            final_msg: '',
            disconnect: false,
            feedback: false,
            typing_delay: 50,
            reaction_time: 1000,
            timeout: 60
        },
        captcha: {
            tries_limit: 3
        }
    };
    try {
        const data = await getData('prefs');
        for(const section in def) {
            for(const property in def[section]) {
                if(data[section][property] === undefined) {
                    data[section][property] = def[section][property];
                }
            }
        }
        return data;
    }
    catch(e) {
        return def;
    }
}