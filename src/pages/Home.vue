<template>
    <div class="px-6 py-4 w-full min-h-full bg-gray-900">
        <h1 class="text-2xl text-gray-100">Looper</h1>

        <div class="mt-3 flex">
            <div class="flex flex-col items-center">
                <div class="px-2 py-1 border-b">
                    <span class="uppercase text-xs text-center text-gray-100">Tempo</span>
                </div>

                <div class="mt-2">
                    <input
                        v-model.number="tempo"
                        type="number"
                        class="w-12"
                    />
                </div>
            </div>

            <div class="ml-3 flex flex-col items-center">
                <div class="px-2 py-1 border-b">
                    <span class="uppercase text-xs text-center text-gray-100">Beats</span>
                </div>

                <div class="mt-2">
                    <input
                        v-model.number="beats"
                        type="number"
                        class="w-12"
                    />
                </div>
            </div>

            <div class="ml-3 flex flex-col items-center">
                <div class="px-2 py-1 border-b">
                    <span class="uppercase text-xs text-center text-gray-100">Start</span>
                </div>

                <div class="mt-2">
                    <div
                        @click="start"
                        class="w-12 h-12 border border-gray-500 hover:border-gray-100 rounded-full flex justify-center items-center">

                    </div>
                </div>
            </div>

<!--            <div class="ml-3 flex flex-col items-center">-->
<!--                <div class="px-2 py-1 border-b">-->
<!--                    <span class="uppercase text-xs text-center text-gray-100">Click</span>-->
<!--                </div>-->

<!--                <div class="mt-2">-->
<!--                    <div-->
<!--                        @click="!clicking ? startClick() : stopClick()"-->
<!--                        class="w-12 h-12 border border-gray-500 hover:border-gray-100 rounded-full flex justify-center items-center">-->

<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->

            <div class="ml-3 flex flex-col items-center">
                <div class="px-2 py-1 border-b">
                    <span class="uppercase text-xs text-center text-gray-100">Pulse</span>
                </div>

                <div class="mt-2">
                    <span class="text-2xl text-gray-100">{{ noteCount }}</span>
                </div>
            </div>

            <div class="ml-3 flex flex-col items-center">
                <div class="px-2 py-1 border-b">
                    <span class="uppercase text-xs text-center text-gray-100">Time</span>
                </div>

                <div class="mt-2">
                    <span class="text-2xl text-gray-100">{{ curTime }}</span>
                </div>
            </div>

            <div class="ml-12 flex flex-col items-center">
                <div class="px-2 py-1 border-b">
                    <span class="uppercase text-xs text-center text-gray-100">Track A</span>
                </div>

                <div class="mt-2">
                    <div
                        @click="recordTrack"
                        class="w-12 h-12 border border-gray-500 hover:border-gray-100 rounded-full flex justify-center items-center">
                        <ProgressRing
                            :radius="100"
                            :progress="progress"
                            :stroke="4"
                            class="w-8 text-gray-100"
                        />
                    </div>
                </div>
            </div>

            <div class="ml-3 flex flex-col items-center">
                <div class="px-2 py-1 border-b">
                    <span class="uppercase text-xs text-center text-gray-100">Track B</span>
                </div>

                <div class="mt-2">
                    <div
                        @click="recordTrack"
                        class="w-12 h-12 border border-gray-500 hover:border-gray-100 rounded-full flex justify-center items-center">
                        <ProgressRing
                            :radius="100"
                            :progress="progress"
                            :stroke="4"
                            class="w-8 text-gray-100"
                        />
                    </div>
                </div>
            </div>

            <div class="ml-3 flex flex-col items-center">
                <div class="px-2 py-1 border-b">
                    <span class="uppercase text-xs text-center text-gray-100">Track C</span>
                </div>

                <div class="mt-2">
                    <div class="w-12 h-12 border border-gray-500 hover:border-gray-100 rounded-full flex justify-center items-center">
                        <ProgressRing
                            :radius="100"
                            :progress="progress"
                            :stroke="4"
                            class="w-8 text-gray-100"
                        />
                    </div>
                </div>
            </div>

            <div class="ml-3 flex flex-col items-center">
                <div class="px-2 py-1 border-b">
                    <span class="uppercase text-xs text-center text-gray-100">offset</span>
                </div>

                <div class="mt-2">
                    <p class="text-white text-center">{{ offset }}</p>
                    <input
                        type="range"
                        min="-1000"
                        max="1000"
                        v-model="offset"
                    />
                </div>
            </div>
        </div>

<!--        <div class="mt-8">-->
<!--            <Analyzer />-->
<!--        </div>-->

        <div class="mt-8">
            <Keyboard
                :octaves="3"
                :starting-octave="3"
            />
        </div>
    </div>
</template>

<script>
    import ProgressRing from "@/components/ProgressRing";
    import Keyboard from "@/components/Keyboard";
    import Piano from '@/components/piano';

    import Analyzer from '@/components/analyzer';

    let context = new AudioContext();

    export default {
        name: 'Looper',
        components: {
            ProgressRing,
            Keyboard,
            Piano,

            Analyzer
        },
        data() {
            return {
                tempo: 60,
                pulses: 8,
                pulse: 0,
                interval: null,
                clicking: false,

                timer: null,
                beats: 4,
                noteCount: 0,
                curTime: 0.0,
                loops: [],


                recorders: [],

                time: 0,

                timetime: 0,
                offset: 0
            };
        },
        mounted() {
            // timer(time => {
            //     console.log(time);
            // });
        },
        // watch: {
        //     async tempo(tempo) {
        //         await this.$nextTick();
        //
        //         this.stopClick();
        //         this.startClick();
        //     }
        // },
        computed: {
            progress() {
                return 100 / this.beats * (this.noteCount - 1);
            }
        },
        methods: {
            async recordTrack() {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);

                const audioChunks = [];
                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    const loop = new Blob(audioChunks);
                    this.loops.push(loop);

                    console.log('loop ready');
                });

                console.log('waiting for beat 1');
                this.recorders.push(mediaRecorder);
            },

            startTimer(callback=(function(){})) {
                let time = 0;

                const init = () => {
                    let start = new Date().getTime();
                    callback(time);

                    setTimeout(() => {
                        let elapsed = new Date().getTime() - start;
                        time += elapsed;
                        init();

                        callback(time);
                    }, 100);
                }

                init();
            },

            start: function () {
                let timer, counting, accentPitch = 380, offBeatPitch = 200;

                this.startTimer((time) => {
                    this.timetime = time;
                });

                const schedule = () => {
                    while (this.curTime < context.currentTime + 0.1) {
                        playDelayedNote(this.curTime);
                        updateTime();
                    }
                    timer = window.setTimeout(schedule, 0.1);
                }

                const updateTime = () => {
                    this.curTime += 60.0 / this.tempo;
                    this.noteCount++;
                }

                /* Play note on a delayed interval of t */
                const playDelayedNote = (t) => {
                    let note = context.createOscillator();

                    if (this.noteCount == this.beats)
                        this.noteCount = 0;

                    if (this.noteCount !== 0) {
                        note.frequency.value = offBeatPitch;
                    } else {
                        note.frequency.value = accentPitch;
                    }

                    note.connect(context.destination);

                    note.start(t);
                    note.stop(t + 0.05);

                    if (this.noteCount == 0) {
                        let delay = 0;

                        // Record loops
                        this.recorders.forEach(async (recorder, index, array) => {
                            switch(recorder.state) {
                                case 'inactive':
                                    console.log('start recording');
                                    recorder.start();
                                    break;
                                case 'recording':
                                    console.log('stop recording');
                                    recorder.stop();
                                    array.splice(index, 1);
                                    break;
                            }
                        });

                        // Play loops
                        console.log('playing loops');
                        this.loops.forEach(async loop => {
                            const arrayBuffer = await loop.arrayBuffer();

                            await context.decodeAudioData(arrayBuffer, (buffer) => {
                                let source = context.createBufferSource();
                                source.buffer = buffer;
                                source.connect(context.destination);

                                source.start(t + this.offset*2/1000);
                            });
                        });
                    }
                }

                counting = true;
                schedule();
            }
        },
    }
</script>
