<template>
    <svg viewBox="0 0 100 100">
        <circle
            class="stroke-current"
            stroke="white"
            :stroke-width="stroke"
            :stroke-dasharray="circumference + ' ' + circumference"
            :style="{ strokeDashoffset: strokeDashoffset }"
            fill="transparent"
            :r="normalizedRadius"
            :cx="50"
            :cy="50"
        />
    </svg>
</template>

<script>
    export default {
        name: 'ProgressRing',
        props: {
            radius: Number,
            progress: Number,
            stroke: Number
        },
        data() {
            return {

            };
        },
        computed: {
            circumference() {
                return this.normalizedRadius * 2 * Math.PI;
            },
            normalizedRadius() {
                return 50 - this.stroke / 2;
            },
            strokeDashoffset() {
                return this.circumference - this.progress / 100 * this.circumference;
            }
        }
    }
</script>
