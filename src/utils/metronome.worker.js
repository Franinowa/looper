let timerID = null

let options = {
    interval: 100,
};

onmessage = function ({ data }) {
    const { cmd, value } = data;

    switch (cmd) {
        case 'start':
            start();
            break;
        case 'stop':
            stop();
            break;
        case 'options':
            options = {
                ...options,
                ...value
            };
            break;
        default:
            break;
    }
}

function start() {
    let start = new Date().getTime();
    let time = 0.0;

    tick(time);

    timerID = setInterval(function() {
        let elapsed = new Date().getTime() - start;
        time = elapsed;

        tick(time);
    }, options.interval);
}

function stop() {
    clearInterval(timerID);
    timerID = null;
}

function tick(time) {
    postMessage({
        cmd: 'tick',
        value: time
    });
}