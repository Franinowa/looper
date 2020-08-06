<template>
    <div
        class="flex-none rounded-b-md shadow-lg cursor-pointer"
        :class="keyClass"
        @keydown="keyDown"
        @keyup="keyUp">
        {{ frequency }}
    </div>
</template>

<script>
    import { getFrequencyByKey } from "@/utils/audio";

    export default {
        name: "Key",
        props: {
            index: {
                type: Number,
                required: true
            },
            octave: {
                type: Number,
                required: true
            },
            type: {
                type: Boolean,
                required: true
            }
        },
        computed: {
            number() {
                return this.index + this.octave * 12;
            },
            frequency() {
                return getFrequencyByKey(this.number);
            },
            keyClass() {
                return {
                    'w-10 h-full bg-gray-100 border border-black hover:bg-white': this.type,
                    '-mx-3 w-6 h-3/5 bg-gray-900 border border-black z-10 hover:bg-black': !this.type
                };
            }
        },
        methods: {
            keyDown() {
                this.$emit('press', this.frequency);
            },
            keyUp() {
                this.$emit('press', this.frequency);
            }
        }
    }
</script>

<style scoped>

</style>