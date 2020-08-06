<template>
    <div class="flex" style="height: 200px;">
        <template v-for="(_, octave) in octaves">
            <Key
                v-for="(_, key) in pattern"
                :key="`${octave+startingOctave}-${key+1}`"
                :index="key+1"
                :octave="octave + startingOctave"
                :type="!!_">
            </Key>
        </template>
    </div>
</template>

<script>
    const pattern = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];

    import Key from './Key';

    export default {
        name: "Keyboard",
        components: {
            Key
        },
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
                pattern
            };
        }
    }
</script>

<style scoped>

</style>