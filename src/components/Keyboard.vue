<template>
    <div class="">
        <div class="flex">
            <div>
                <input type="range" min="0" max="100" v-model="volume" @input="setGain(volume)"/>
            </div>
        </div>
        <div class="flex" style="height: 200px;">
            <template v-for="octave in octaves">
                <div
                    v-for="(frequency, index) in frequencies"
                    :key="getFrequency(index, octave)"
                    :ref="bindings[index]"
                    :frequency="getFrequency(index, octave)"
                    class="key flex-none"
                    :class="{ 'white': !!pattern[index], 'black': !pattern[index] }"
                    @mousedown="keyPress(getFrequency(index, octave))"
                    @mouseup="keyRelease(getFrequency(index, octave))"
                />
            </template>

            <div
                class="key white"
                @mousedown="keyPress(calcFrequency(keysLength+1))"
                @mouseup="keyRelease(calcFrequency(keysLength+1))"
            />
        </div>

    </div>
</template>

<script>
    const baseFrequency = 440;
    const baseKey = 58;
    const a = Math.pow(2, 1/12);

    const context = new AudioContext();

    const bindings = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j'];
    const pattern = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];
    const frequencies = [16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87];

    export default {
        name: "Keyboard",
        props: {
            startingOctave: {
                type: Number,
                default: 3
            },
            octaves: {
                type: Number,
                default: 2
            }
        },
        data() {
            return {
                pattern,
                frequencies,
                bindings,

                notes: [],
                gainNode: null,
                volume: 50
            };
        },
        computed: {
            keysLength() {
                return 12 * this.octaves + 12 * this.startingOctave;
            }
        },
        methods: {
            getFrequency(index, octave) {
                const key = this.getKeyNumber(index, octave)
                return this.calcFrequency(key);
            },
            getKeyNumber(index, octave) {
                return (index + 1) + (octave + this.startingOctave - 1) * 12;
            },
            calcFrequency(key) {
                const n = key - baseKey;
                return baseFrequency * Math.pow(a, n);
            },
            keyPress(frequency) {
                console.log('pressing note: ', frequency);
                this.playNote(frequency);
            },
            keyRelease(frequency) {
                console.log('releasing note: ', frequency);
                this.stopNote(frequency);
            },

            playNote(freq) {
                let oscillator = context.createOscillator();
                let u = context.createGain();
                oscillator.connect(u);
                oscillator.frequency.value=freq;
                oscillator.type='sine';
                u.connect(this.gainNode);
                u.gain.value=100*0.01;
                oscillator.start();

                this.notes = {
                    ...this.notes,
                    [freq]: oscillator
                };
            },

            stopNote(freq) {
                if (this.notes[freq]) {
                    this.notes[freq].stop();

                    delete this.notes[freq];
                }
            },

            setGain(gain) {
                console.log('gain: ', gain);
                this.gainNode.gain.value = parseFloat(gain);
            }
        },
        created() {
            this.gainNode = context.createGain();
            this.gainNode.connect(context.destination);
        },
        mounted() {
            // Keyboard mapping
            const keyDown = ({ key, repeat }) => {
                if (repeat) { return }

                if (!this.$refs[key]) { return }

                const element = this.$refs[key][0];
                const freq = element.getAttribute('frequency');

                this.keyPress(freq);
            }

            const keyUp = ({ key }) => {
                if (!this.$refs[key]) { return }

                const element = this.$refs[key][0];
                const freq = element.getAttribute('frequency');

                this.keyRelease(freq);
            }

            document.addEventListener('keydown', keyDown);
            document.addEventListener('keyup', keyUp);

            this.$once('hook:destroyed', () => {
                document.removeEventListener('keydown', keyDown);
                document.removeEventListener('keyup', keyUp);
            });
        }
    };
</script>

<style scoped>
    .key {
        @apply rounded-b-md shadow-md cursor-pointer;
    }

    .key.white {
        @apply w-12 h-full bg-gray-100 border border-black;
    }

    .key.white:hover {
        @apply bg-white;
    }

    .key.black {
        @apply -mx-4 w-8 h-3/5 bg-gray-900 border border-black z-10;
    }

    .key.black:hover {
        @apply bg-black;
    }
</style>