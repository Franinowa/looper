<template>
    <div>
        <div class="flex items-center">
            <div>
                <button @click="play">
                    Play
                </button>
                <audio
                    ref="audio"
                    src="audios/perfect.mp3"
                    controls
                />
            </div>

            <div class="ml-4">
                <input
                    type="range"
                    min="0"
                    max="100"
                    class="w-64"
                    v-model="volume"
                />

                <span class="ml-3 text-3xl text-white">{{ volume }}</span>
            </div>
        </div>

        <div>
            <canvas ref="canvas" width="680" height="480"></canvas>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Analyzer",
        data() {
            return {
                audio: null,
                volume: 50
            };
        },
        methods: {
            play() {
                // this.audio.play();
            },
            async init() {
                const context = new AudioContext();
                const gain = context.createGain();
                gain.gain.value = 1;
                const analyser = context.createAnalyser()


                const audio = new Audio('audios/perfect.mp3');
                console.log(audio);
                const input = context.createMediaElementSource(this.$refs.audio);

                this.audio = audio;

                input.connect(gain);
                // analyser.connect(gain);
                gain.connect(context.destination);

                console.log(input);

                // draw
                const canvas = this.$refs.canvas;
                const waveform = new Uint8Array(analyser.fftSize)
                const frequencies = new Uint8Array(analyser.frequencyBinCount)
                const ctx = canvas.getContext('2d')

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    analyser.getByteTimeDomainData(waveform)
                    analyser.getByteFrequencyData(frequencies)

                    ctx.beginPath()
                    waveform.forEach((f, i) => ctx.lineTo(i, f))
                    ctx.lineTo(0,255)
                    frequencies.forEach((f, i) => ctx.lineTo(i, 255-f))
                    ctx.stroke();

                    window.requestAnimationFrame(loop)
                }

                window.requestAnimationFrame(loop);
            }
        },
        mounted() {
            this.init();
        }
    }
</script>

<style scoped>

</style>