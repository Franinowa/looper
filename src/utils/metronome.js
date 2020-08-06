import Emitter from "./Emitter";
import TimerWorker from 'worker-loader!./metronome.worker.js';

let defaultOptions = {
    tempo: 60.0,       // tempo (in beats per minute)
    meter: 4,
    masterVolume: 0.5,
    accentVolume: 1,
    quarterVolume: 0.75,
    eighthVolume: 0,
    sixteenthVolume: 0,
    tripletVolume: 0,
    lookahead: 25.0,        // How frequently to call scheduling function (in milliseconds)
    scheduleAheadTime: 0.1,
    noteLength: 0.05,       // length of "beep" (in seconds)
};

let globalTime = 0.0;
let nextBeat = 0.0;

export default class Metronome extends Emitter {
    constructor(options={}) {
        super();

        this.options = {
            ...defaultOptions,
            ...options
        };

        this.audioContext = null;
        this.isPlaying = false;      // Are we currently playing?
        this.startTime;              // The start time of the entire sequence.
        this.currentTwelveletNote;        // What note is currently last scheduled?

        this.nextNoteTime = 0.0;     // when the next note is due.
        this.notesInQueue = [];      // the notes that have been put into the web audio,
                                    // and may or may not have played yet. {note, time}
        this.timerWorker = null;     // The Web Worker used to fire timer messages

        this.init();
    }
    start() {
        this.timerWorker.postMessage({ cmd: 'start' });
    }
    stop() {
        this.timerWorker.postMessage({ cmd: 'stop' });
        nextBeat = 0;
    }
    maxBeats() {
        let beats = (this.options.meter * 12);
        return beats;
    }

    nextTwelvelet() {
        let secondsPerBeat = 60.0 / this.options.tempo;
        this.nextNoteTime += 1 / 12 * secondsPerBeat;    // Add beat length to last beat time
        this.currentTwelveletNote++;    // Advance the beat number, wrap to zero

        if (this.currentTwelveletNote == this.maxBeats()) {
            this.currentTwelveletNote = 0;
        }
    }

    calcVolume(beatVolume) {
        return (beatVolume * this.options.masterVolume);
    }

    scheduleNote(beatNumber, time) {
        // push the note on the queue, even if we're not playing.
        this.notesInQueue.push({ note: beatNumber, time: time });

        // create oscillator & gainNode & connect them to the context destination
        let osc = this.audioContext.createOscillator();
        let gainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        if (beatNumber % this.maxBeats() === 0) {
            if (this.options.accentVolume > 0.25) {
                osc.frequency.value = 880.0;
                gainNode.gain.value = this.calcVolume(this.options.accentVolume);
            } else {
                osc.frequency.value = 440.0;
                gainNode.gain.value = this.calcVolume(this.options.quarterVolume);
            }
        } else if (beatNumber % 12 === 0) {   // quarter notes = medium pitch
            osc.frequency.value = 440.0;
            gainNode.gain.value = this.calcVolume(this.options.quarterVolume);
        } else if (beatNumber % 6 === 0) {
            osc.frequency.value = 440.0;
            gainNode.gain.value = this.calcVolume(this.options.eighthVolume);
        } else if (beatNumber % 4 === 0) {
            osc.frequency.value = 300.0;
            gainNode.gain.value = this.calcVolume(this.options.tripletVolume);
        } else if (beatNumber % 3 === 0 ) {                    // other 16th notes = low pitch
            osc.frequency.value = 220.0;
            gainNode.gain.value = this.calcVolume(this.options.sixteenthVolume);
        } else {
            gainNode.gain.value = 0;   // keep the remaining twelvelet notes inaudible
        }

        osc.start(time);
        osc.stop(time + this.options.noteLength);

        osc.onended = () => {
            // this.notesInQueue.shift();
            // console.log('Note stop playing!', beatNumber, time);
        }
    }

    scheduler() {
        while (this.nextNoteTime < this.audioContext.currentTime + this.options.scheduleAheadTime ) {
            this.scheduleNote( this.currentTwelveletNote, this.nextNoteTime );
            this.nextTwelvelet();
        }
    }

    play() {
        this.isPlaying = !this.isPlaying;

        if (this.isPlaying) {
            this.currentTwelveletNote = 0;
            this.nextNoteTime = this.audioContext.currentTime;
            this.start();
        } else {
            this.stop();
        }
    }

    init(){
        this.audioContext = new AudioContext();
        this.timerWorker = new TimerWorker;

        this.timerWorker.onmessage = ({ data }) => {
            const { cmd, value } = data;

            switch(cmd) {
                case 'tick':
                    this.scheduler();

                    if (value >= nextBeat) {
                        const msPerBeat = 60.0*1000 / this.options.tempo;
                        nextBeat = nextBeat + msPerBeat;

                        this.trigger({
                            type: 'tick',
                            value
                        });
                    }

                    break;
            }
        };

        this.timerWorker.postMessage({ cmd: 'options', value: { interval: this.options.lookahead } });
    }
}