<template>
    <Circle v-if="select === 0"  />
    <Circle2 v-else-if="select === 1"  />
    <!-- <Circle3 v-else-if="select === 2"  /> -->
    <Circle4 v-else-if="select === 3"  />
    <Circle5 v-else-if="select === 4"  />
    <Circle6 v-else-if="select === 5"  />
    <Circle7 v-else-if="select === 6"  />
    <Circle8 v-else-if="select === 7"  />
    <Circle9 v-else-if="select === 8"  />
    <Circle10 v-else-if="select === 9"  />
    <Circle11 v-else-if="select === 10"  />
    <CubeShadow v-else-if="select === 11"  />
    <Diamond v-else-if="select === 12"  />
    <DoubleBounce v-else-if="select === 13"  />
    <Gauge v-else-if="select === 14"  />
    <Google v-else-if="select === 15"  />
    <Hexagon v-else-if="select === 16"  />
    <HourGlass v-else-if="select === 17"  />
    <Jawn v-else-if="select === 18"  />
    <Jumper v-else-if="select === 19"  />
    <LetterCube v-else-if="select === 20"  />
    <Mikepad v-else-if="select === 21"  />
    <Origami v-else-if="select === 22"  />
    <Pencil v-else-if="select === 23"  />
    <PingPong v-else-if="select === 24"  />
    <Plane v-else-if="select === 25"  />
    <RotateSquare v-else-if="select === 26"  />
    <RotateSquare2 v-else-if="select === 27"  />
    <RotateSquare3 v-else-if="select === 28"  />
    <RotateSquare4 v-else-if="select === 29"  />
    <RotateSquare5 v-else-if="select === 30"  />
    <RotateSquare6 v-else-if="select === 31"  />
    <Socket v-else-if="select === 32"  />
    <SpinLine v-else-if="select === 33"  />
    <SquareGrid v-else-if="select === 34"  />
    <Stretch v-else-if="select === 35"  />
    <Texture v-else-if="select === 36"  />
    <ThreeDots v-else-if="select === 37"  />
    <TwoCube v-else-if="select === 38"  />
    <Wave v-else-if="select === 39"  />
</template>

<script setup lang="ts">
    import Circle from './Loading/Circle.vue';
    import Circle2 from './Loading/Circle2.vue';
    // Circle3 被注释掉了，不需要导入
    import Circle4 from './Loading/Circle4.vue';
    import Circle5 from './Loading/Circle5.vue';
    import Circle6 from './Loading/Circle6.vue';
    import Circle7 from './Loading/Circle7.vue';
    import Circle8 from './Loading/Circle8.vue';
    import Circle9 from './Loading/Circle9.vue';
    import Circle10 from './Loading/Circle10.vue';
    import Circle11 from './Loading/Circle11.vue';
    import CubeShadow from './Loading/CubeShadow.vue';
    import Diamond from './Loading/Diamond.vue';
    import DoubleBounce from './Loading/DoubleBounce.vue';
    import Gauge from './Loading/Gauge.vue';
    import Google from './Loading/Google.vue';
    import Hexagon from './Loading/Hexagon.vue';
    import HourGlass from './Loading/HourGlass.vue';
    import Jawn from './Loading/Jawn.vue';
    import Jumper from './Loading/Jumper.vue';
    import LetterCube from './Loading/LetterCube.vue';
    import Mikepad from './Loading/Mikepad.vue';
    import Origami from './Loading/Origami.vue';
    import Pencil from './Loading/Pencil.vue';
    import PingPong from './Loading/PingPong.vue';
    import Plane from './Loading/Plane.vue';
    import RotateSquare from './Loading/RotateSquare.vue';
    import RotateSquare2 from './Loading/RotateSquare2.vue';
    import RotateSquare3 from './Loading/RotateSquare3.vue';
    import RotateSquare4 from './Loading/RotateSquare4.vue';
    import RotateSquare5 from './Loading/RotateSquare5.vue';
    import RotateSquare6 from './Loading/RotateSquare6.vue';
    import Socket from './Loading/Socket.vue';
    import SpinLine from './Loading/SpinLine.vue';
    import SquareGrid from './Loading/SquareGrid.vue';
    import Stretch from './Loading/Stretch.vue';
    import Texture from './Loading/Texture.vue';
    import ThreeDots from './Loading/ThreeDots.vue';
    import TwoCube from './Loading/TwoCube.vue';
    import Wave from './Loading/Wave.vue';

    import { ref, inject, computed, watch, onMounted } from 'vue';
    const select = ref(Math.floor(Math.random()*40));
</script>