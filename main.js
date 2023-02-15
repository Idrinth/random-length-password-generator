(async () => {
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
    const validate = () => {
        const min = document.getElementById('min');
        const max = document.getElementById('max');
        const act = document.getElementById('act');
        const minVal = Number.parseInt(min.value);
        const maxVal = Number.parseInt(max.value);
        min.removeAttribute('class');
        max.removeAttribute('class');
        if (minVal < 256) {
            min.setAttribute('class', 'error');
        }
        if (maxVal < 256) {
            max.setAttribute('class', 'error');
        }
        if (minVal > 65536) {
            min.setAttribute('class', 'error');
        }
        if (maxVal > 65536) {
            max.setAttribute('class', 'error');
        }
        if (minVal > maxVal) {
            min.setAttribute('class', 'error');
            max.setAttribute('class', 'error');
        }
        act.disabled = min.hasAttribute('class') || max.hasAttribute('class');
    };
    const generate = () => {
        fillDictionary(dictionary, window);
        if (document.getElementById('act').disabled) {
            document.getElementById('out').value = '';
            return;
        }
        window.setTimeout(() => {document.getElementById('bg').setAttribute('style', 'display: block')}, 1);
        window.setTimeout(() => {
            let check = document.getElementById('cps').checked;
            if (check) {
                check = window.confirm('Are you sure you want to check the password strength? It takes a while.')
            }
            const length = (() => {
                let out = 0;
                let min = Number.parseInt(document.getElementById('min').value);
                let max = Number.parseInt(document.getElementById('max').value);
                if (min < 256) {
                    min = 256;
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
                while (out < min || out > max) {
                    out = Math.ceil(Math.pow(2, 8 + Math.random() * 8));
                }
                return out;
            })();
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
            document.getElementById('out').value = out.join('');
            if (check && typeof zxcvbnts !== 'undefined') {
                const strength = zxcvbnts.core.zxcvbn(document.getElementById('out').value);
                document.getElementById('strength').value = strength.score;
                document.getElementById('feedback').value = 'Crack Time: ' + strength.crackTimesDisplay.offlineFastHashing1e10PerSecond;
                document.getElementById('bg').setAttribute('style', 'display: none');
            } else if (check && typeof wrk !== 'undefined') {
                wrk.postMessage(document.getElementById('out').value);
            } else {
                document.getElementById('bg').setAttribute('style', 'display: none');
            }
        },1);
    };
    const blacklist = () => {
        document.getElementById('bl').value = document.getElementById('blf').value;
    };
    document.getElementById('min').onchange = validate;
    document.getElementById('max').onchange = validate;
    document.getElementById('min').onblur = validate;
    document.getElementById('max').onblur = validate;
    document.getElementById('act').onclick = generate;
    document.getElementById('blf').onchange = blacklist;
    document.getElementById('blf').onblur = blacklist;
})();