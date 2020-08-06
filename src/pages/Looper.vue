<template>
    <div class="px-6 py-4 w-full min-h-full">
        <h1 class="text-2xl text-gray-900">Looper</h1>

        <button @click="metronome.play()" class="px-4 py-1 bg-blue-400 rounded-lg">
            <span class="text-white">Play</span>
        </button>

        <button
            class="ml-2 w-20 h-20 bg-gray-100 rounded-full"
            :class="classes"
        >
            tap
        </button>
    </div>
</template>

<script>
    import Metronome from '@/utils/metronome';

    export default {
        name: "Looper",
        data() {
            return {
                metronome: null,
                classes: ''
            };
        },
        created() {
            this.metronome = new Metronome({
                tempo: 60
            });

            this.metronome.on('tick', (event) => {
                console.log('time: ', event.value);
                this.classes = 'bg-green-500';
                setTimeout(() => {
                    this.classes = '';
                }, 100)
            });
        }
    }
</script>