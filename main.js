(async () => {
    const NUMBER_CHARACTERS = '0123456789'.split('');
    const UPPER_CASE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const LOWER_CASE_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const SPECIAL_CHARACTERS = '!";#$%&\'()*+,-./:;<>=?@^\[]_`´{}|~'.split('');
    const wrk = typeof window.Worker === 'undefined' ? undefined : new Worker('worker.js');
    const dictionary = {};
    if (wrk) {
        wrk.onmessage = (e) => {
            const strength = JSON.parse(e.data);
            document.getElementById('strength').value = strength.score;
            document.getElementById('feedback').value = 'Crack Time: ' + strength.crackTimesDisplay.offlineFastHashing1e10PerSecond;
            document.getElementById('bg').setAttribute('style', 'display: none');
        };
    } else {
        const scripts = await (await fetch('scripts.json')).json();
        for (const script of Object.keys(scripts)) {
            const s = document.createElement('script');
            s.setAttribute('src', `https://cdn.jsdelivr.net/npm/@zxcvbn-ts/${script}@${scripts[script]}/dist/zxcvbn-ts.js`);
            document.body.appendChild(s);
        }
    }
    const enabledAndChecked = (id) => {
        if (!document.getElementById(id)) {
            return false;
        }
        if (document.getElementById(id).disabled) {
            return false;
        }
        if (!document.getElementById(id).checked) {
            return false;
        }
        return true;
    };
    const validate = () => {
        const min = document.getElementById('min');
        const max = document.getElementById('max');
        const act = document.getElementById('act');
        const minVal = Number.parseInt(min.value);
        const maxVal = Number.parseInt(max.value);
        let errored = false;
        min.removeAttribute('class');
        max.removeAttribute('class');
        if (minVal < 8) {
            errored = true;
            min.setAttribute('class', 'error');
        } else if (minVal < 256) {
            min.setAttribute('class', 'warning');
        }
        if (maxVal < 8) {
            errored = true;
            max.setAttribute('class', 'error');
        } else if (maxVal < 256) {
            max.setAttribute('class', 'warning');
        }
        if (minVal > 65536) {
            errored = true;
            min.setAttribute('class', 'error');
        }
        if (maxVal > 65536) {
            errored = true;
            max.setAttribute('class', 'error');
        }
        if (minVal > maxVal) {
            errored = true;
            min.setAttribute('class', 'error');
            max.setAttribute('class', 'error');
        }
        act.disabled = errored;
    };
    const containsAny = (string, letters) => {
        for (const letter of letters) {
            if (string.includes(letter)) {
                return true;
            }
        }
        return false;
    };
    const containsAll = (string, letters) => {
        for (const letter of letters) {
            if (!string.includes(letter)) {
                return false;
            }
        }
        return true;
    };
    const generate = () => {
        fillDictionary(dictionary, window);
        if (document.getElementById('act').disabled) {
            document.getElementById('out').value = '';
            return;
        }
        window.setTimeout(() => {document.getElementById('bg').setAttribute('style', 'display: block');}, 1);
        window.setTimeout(() => {
            let check = document.getElementById('cps').checked;
            if (check) {
                check = window.confirm('Are you sure you want to check the password strength? It takes a while.');
            }
            const length = (() => {
                let out = 0;
                let min = Number.parseInt(document.getElementById('min').value);
                let max = Number.parseInt(document.getElementById('max').value);
                if (min < 8) {
                    min = 8;
                }
                if (max > 65536) {
                    max = 65536;
                }
                if (max < min) {
                    return min;
                }
                if (max === min) {
                    return min;
                }
                if (max < 256) {
                    return max;
                }
                while (out < min || out > max) {
                    out = Math.ceil(Math.pow(2, 8 + Math.random() * 8));
                }
                return out;
            })();
            if (length < 256) {
                if (!window.confirm('Are you sure you want to create such a short password?')) {
                    document.getElementById('bg').setAttribute('style', 'display: none');
                    return;
                }
            }
            document.getElementById('op').value = ` (${length})`;
            const bl = document.getElementById('bl').value.split('');
            const characters = (() => {
                const d = [];
                for (let i = 32; i < 127; ++i) {
                    d.push(String.fromCharCode(i));
                }
                return d;
            })().filter(x => !bl.includes(x));
            if (characters.length === 0) {
                document.getElementById('bg').setAttribute('style', 'display: none');
                return;
            }
            const out = [];
            while (out.length < length) {
                out.push(characters[Math.floor(Math.random() * characters.length)]);
            }
            const value = out.join('');
            if (enabledAndChecked('ern')) {
                if (!containsAny(value, NUMBER_CHARACTERS)) {
                    window.setTimeout(() => {document.getElementById('act').click();}, 1);
                    return;
                }
            }
            if (enabledAndChecked('erucl')) {
                if (!containsAny(value, UPPER_CASE_CHARACTERS)) {
                    window.setTimeout(() => {document.getElementById('act').click();}, 1);
                    return;
                }
            }
            if (enabledAndChecked('erlcl')) {
                if (!containsAny(value, LOWER_CASE_CHARACTERS)) {
                    window.setTimeout(() => {document.getElementById('act').click();}, 1);
                    return;
                }
            }
            if (enabledAndChecked('ersc')) {
                if (!containsAny(value, SPECIAL_CHARACTERS)) {
                    window.setTimeout(() => {document.getElementById('act').click();}, 1);
                    return;
                }
            }
            document.getElementById('out').value = value;
            if (check && typeof zxcvbnts !== 'undefined') {
                const strength = zxcvbnts.core.zxcvbn(value);
                document.getElementById('strength').value = strength.score;
                document.getElementById('feedback').value = 'Crack Time: ' + strength.crackTimesDisplay.offlineFastHashing1e10PerSecond;
                document.getElementById('bg').setAttribute('style', 'display: none');
            } else if (check && typeof wrk !== 'undefined') {
                wrk.postMessage(value);
            } else {
                document.getElementById('bg').setAttribute('style', 'display: none');
            }
        },1);
    };
    const blacklist = () => {
        const value = document.getElementById('bl').value;
        document.getElementById('ern').disabled = containsAll(value, NUMBER_CHARACTERS);
        document.getElementById('erucl').disabled = containsAll(value, UPPER_CASE_CHARACTERS);
        document.getElementById('erlcl').disabled = containsAll(value, LOWER_CASE_CHARACTERS);
        document.getElementById('ersc').disabled = containsAll(value, SPECIAL_CHARACTERS);
    };
    const autoBlacklist = () => {
        document.getElementById('bl').value = document.getElementById('blf').value;
        blacklist();
    };
    document.getElementById('min').onchange = validate;
    document.getElementById('max').onchange = validate;
    document.getElementById('min').onblur = validate;
    document.getElementById('max').onblur = validate;
    document.getElementById('act').onclick = generate;
    document.getElementById('blf').onchange = autoBlacklist;
    document.getElementById('blf').onblur = autoBlacklist;
    document.getElementById('bl').onchange = blacklist;
    document.getElementById('bl').onblur = blacklist;
    document.getElementById('ern').onchange = blacklist;
    document.getElementById('ern').onblur = blacklist;
    document.getElementById('erucl').onchange = blacklist;
    document.getElementById('erucl').onblur = blacklist;
    document.getElementById('erlcl').onchange = blacklist;
    document.getElementById('erlcl').onblur = blacklist;
    document.getElementById('ersc').onchange = blacklist;
    document.getElementById('ersc').onblur = blacklist;
    validate();
})();