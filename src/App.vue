<script setup lang="ts">
import WordSearch from './components/WordSearch.vue'
import WordDictation from './components/WordDictation.vue'
import { ref } from 'vue'
import { ElCarousel } from 'element-plus';
import axios from 'axios';
const currentIndex = ref('first')
const inputFocus = ref(false)

if (process.env.NODE_ENV != 'development') {
    (() => {
        function block() {
            setInterval(() => {
                eval('debugger;')
            });
        }
        try {
            block()
        } catch (err) {}
    })()
    document.addEventListener('keydown', function(e) {
        if (e.key == 'F12'
        || (e.key.toLowerCase() == 'i' && e.shiftKey && e.ctrlKey)
        || (e.key.toLowerCase() == 'u' && e.ctrlKey)) {
            e.stopImmediatePropagation()
            e.stopPropagation()
            e.preventDefault()
            return false
        }
    })
    document.addEventListener('contextmenu', function(e) {
        e.stopImmediatePropagation()
        e.stopPropagation()
        e.preventDefault()
        return false
    })
}

const wordData = ref<Array<{}>>([]);
const root = process.env.NODE_ENV == 'development' ? '/src' : ''
axios.get(`.${root}/assets/data/total.json`).then((res) => {
// axios.get(`.${root}/assets/data/CET4_2.json`).then((res) => {
// axios.get(`${root}/assets/data/Level8_2.json`).then((res) => {
    if (res.data) {
        wordData.value = res.data.trim().split('\n').map((line: string) => JSON.parse(line).content.word)
        console.log(wordData.value)
        // wordData.value.sort((a: any, b: any)=>a.word.localeCompare(b.word))
    }
})
// const cet4words = ref<Array<any>>([]);
// axios.get(`.${root}/assets/data/CET4luan_2.json`).then((res) => {
//     if (res.data) {
//         cet4words.value = res.data.trim().split('\n').map((line: string) => JSON.parse(line).content.word)
//         console.log(cet4words.value)
//         // wordData.value.sort((a: any, b: any)=>a.word.localeCompare(b.word))
//     }
// })

function inputFocusHandler() {
    inputFocus.value = true
}
function inputBlurHandler() {
    inputFocus.value = false
}
const navCarousel = ref<typeof ElCarousel | null>(null)

const names: Array<string> = [
    'first', 'second', 'third', 'fourth', 'fifth'
]
function tabChangeHandler( name: string ) {
    const index = names.indexOf(name);
    if ( index != -1 ) {
        let navCar: typeof ElCarousel | null = navCarousel.value;
        if (navCar != null) {
            navCar.setActiveItem(index);
        }
    }
}

function getRandomBgImg() {
    return ['0a749cae2365e38083f1fa5d8e722333.jpg', 
            '0cf2e70f54d72245000a0e5ba1476beb.jpg', 
            '0p2pyiaxlud0p2pyiaxlud.jpg', 
            '27380081_1381558576411.jpg', 
            '29305cdb4125ea2c813bac60326e5e13.jpg', 
            '4a8971832a18a6a52cd1e8a6b74100685197.jpeg', 
            'dxkgr4yumhodxkgr4yumho.jpg', 
            'ymszindgoegymszindgoeg.jpg'][Math.trunc(Math.random() * 8)]
}
const listState = ref(true)
const backgroundImage = ref<string>(getRandomBgImg())

const popWrapper = ref<HTMLElement>()
const isCardPop = ref<boolean>(false)

const popConfig: { origin: HTMLElement | null, clone: HTMLElement | null } = {
    origin: null, 
    clone: null
}

const audio = new Audio()
function speak(word: string, type: 1 | 2) {
    audio.src = `https://dict.youdao.com/dictvoice?audio=${word.replace(/’/g, "'")}&type=${type}`
    audio.play();
}

function enlarger(e: MouseEvent) {
    let element: HTMLElement = e.target as HTMLElement, rect: DOMRect, popElement: HTMLElement;
    while (element.parentElement !== null && !element.classList.contains('word-card')) {
        element = element.parentElement
    }
    popElement = element.cloneNode(true) as HTMLElement;
    popElement.querySelectorAll('.phones > .el-tag').forEach((tag, i) => tag.addEventListener('click', function(e) {
        e.stopImmediatePropagation();
        speak(popElement.querySelector('.word')?.textContent || '', i == 0 ? 1 : 2)
    }))
    popElement.querySelectorAll('.english-readable').forEach((tag, i) => tag.addEventListener('click', function(e) {
        e.stopImmediatePropagation();
        speak((e.target as HTMLElement).textContent || '', i == 0 ? 1 : 2)
    }))
    rect = element.getBoundingClientRect()
    // console.log(rect)
    // console.log(element.parentElement?.getBoundingClientRect())
    popWrapper.value?.append(popElement)
    popElement.style.animation = `unset`
    isCardPop.value = true
    element.style.opacity = '0'
    popElement.animate([
        {
            width: `${rect.width - 48}px`, 
            height: `${rect.height - 48}px`, 
            padding: `24px`, 
            opacity: 1, 
            position: 'fixed', 
            zIndex: 10, 
            top: `${rect.top}px`, 
            left: `${rect.left}px`, 
            right: `${rect.right}px`
        }, {
            width: `calc(64vw - 96px)`, 
            height: `64vh`, 
            padding: `48px`, 
            opacity: 1, 
            position: 'fixed', 
            zIndex: 10, 
            top: '188px', 
            left: '18vw', 
            right: '18vw'
        }
    ], { duration: 300, easing: 'cubic-bezier(0.42, 0, 0.58, 1)' }).finished.then(() => {
        // popElement.remove()
        popElement.style.width = `calc(64vw - 96px)`
        popElement.style.height = `64vh`
        popElement.style.padding = `48px`
        popElement.style.opacity = '1'
        popElement.style.position = 'fixed'
        popElement.style.zIndex = '100'
        popElement.style.top = `188px`
        popElement.style.left = `18vw`
        popElement.style.right = `18vw`
        popElement.querySelector('.other-info')?.classList.add('show-info');
    })
    popConfig.origin = element
    popConfig.clone = popElement
}

function enSmaller() {
    if (popConfig.origin !== null && popConfig.clone !== null) {
        const rect = popConfig.origin.getBoundingClientRect();
        isCardPop.value = false
        popConfig.clone.scrollTo({
            top: 0, 
            behavior: 'smooth'
        })
        // popConfig.clone.querySelector('.other-info')?.classList.remove('show-info');
        popConfig.origin.style.opacity = '0'
        popConfig.clone.animate([
            {
                width: `calc(64vw - 96px)`, 
                height: `64vh`, 
                padding: `48px`, 
                opacity: 1, 
                position: 'fixed', 
                zIndex: 10, 
                top: '188px', 
                left: '18vw', 
                right: '18vw'
            }, {
                width: `${rect.width - 48}px`, 
                height: `${rect.height - 48}px`, 
                padding: `24px`, 
                opacity: 1, 
                position: 'fixed', 
                zIndex: 10, 
                top: `${rect.top}px`, 
                left: `${rect.left}px`, 
                right: `${rect.right}px`
            }
        ], { duration: 300, easing: 'cubic-bezier(0.42, 0, 0.58, 1)' }).finished.then(() => {
            if (popConfig.clone !== null && popConfig.origin !== null) {
                popConfig.clone.remove()
                popConfig.origin.style.opacity = '1'
            }
        })
    }
}

const oldMaskBg = ref();
function changeBgImg() {
    const newImgUri = getRandomBgImg()
    // const img = new Image()
    // img.src = `.${root}/assets/background/${newImgUri}`
    oldMaskBg.value.style.backgroundImage = `url(.${root}/assets/background/${backgroundImage.value})`
    backgroundImage.value = newImgUri
    oldMaskBg.value.animate([
        { opacity: 1.0 }, 
        { opacity: 0.0 }
    ], { duration: 2000 }).finished.then(() => {
        oldMaskBg.value.style.backgroundImage = 'unset'
    })
    // img.addEventListener("load", function() {
    //     if (oldMaskBg.value != null) {
    //     }
    // })
    // if (img.complete) {
    //     backgroundImage.value = newImgUri
    // }
}

setInterval(() => {
    changeBgImg()
}, 16000)
</script>

<template>
    <div class="background-image" :class="{'input-focus': inputFocus}" :style="{'background-image': `url(.${root}/assets/background/${backgroundImage})`}"></div>
    <div class="background-image" :class="{'input-focus': inputFocus}" ref="oldMaskBg"></div>
    <div class="background-mask" :class="{'input-focus': inputFocus}"></div>
    <el-tabs v-model="currentIndex" class="nav-tabs" @tab-change="tabChangeHandler">
        <el-tab-pane label="词典" name="first"></el-tab-pane>
        <el-tab-pane label="默写" name="second"></el-tab-pane>
        <el-tab-pane label="管理" name="third"></el-tab-pane>
        <el-tab-pane label="更多" name="fourth"></el-tab-pane>
        <el-tab-pane label="" name="fifth"></el-tab-pane>
    </el-tabs>
    <el-carousel ref="navCarousel" class="nav-tabs-content" 
        height="calc(100vh - 100px)" arrow="never" :autoplay="false" indicator-position="none" :loop="false"
        @mousedown="listState=!listState">
        <el-carousel-item class="nav-tab-pane">
            <WordSearch @cardClick="enlarger" :wordData="wordData" :listState="listState" @input-focus="inputFocusHandler" @input-blur="inputBlurHandler"></WordSearch>
        </el-carousel-item>
        <el-carousel-item>
            <WordDictation></WordDictation>
        </el-carousel-item>
        <el-carousel-item>
            <div class="glass-card">
                <div style="color: white;">暂未开放后台，敬请期待……</div>
            </div>
        </el-carousel-item>
        <el-carousel-item>
            <div class="glass-card">
                <div style="color: white;">暂未开放其他功能，敬请期待……</div>
            </div>
        </el-carousel-item>
        <el-carousel-item></el-carousel-item>
    </el-carousel>
    <div ref="popWrapper" @click="enSmaller" class="pop-wrapper" :class="{ 'pop-wrapper-background': isCardPop }"></div>
</template>

<style lang="scss">
body {
    margin: 0px;
}
.glass-card {
    backdrop-filter: blur(48px);
    border-radius: 24px;
    background-color: #00000044;
    width: 32vw;
    height: 38vh;
    padding: 24px;
    user-select: none;
    box-shadow: 0px 0px 0px #66666666;
    transition: box-shadow 300ms;
    
    display: flex;
    justify-content: center;
    align-items: center;
}
.background-image {
    position: fixed;
    inset: 0;
    // background-image: url(assets/background/4a8971832a18a6a52cd1e8a6b74100685197.jpeg);
    // background-image: url(assets/background/ymszindgoegymszindgoeg.jpg);
    // background-image: url(assets/background/0p2pyiaxlud0p2pyiaxlud.jpg); 
    background-size: cover;
    background-position: center;
    transition: transform 400ms;
    &.input-focus {
        transform: scale(1.2);
    }
}
.background-mask {
    position: fixed;
    inset: 0;
    background-color: #00000066;
    backdrop-filter: blur(18px);
    opacity: 0;
    transition: opacity 400ms ease-in-out;
    &.input-focus {
        opacity: 1;
    }
}
.nav-tabs {
    .el-tabs__header {
        // background-image: linear-gradient(to bottom, #00000066 40%, transparent);
        height: 80px;
        &::after {
            content: '';
            display: block;
            position: absolute;
            inset: 0;
            backdrop-filter: blur(18px);
            // background-color: #00000066;
            @supports (-webkit-mask-image: -webkit-gradient(linear, left top, left bottom, from(#000000), color-stop(74%, #000000), to(transparent))) {
                -webkit-mask-image: -webkit-gradient(linear, left top, left bottom, from(#000000), color-stop(74%, #000000), to(transparent));
            }
        }
        .el-tabs__nav-wrap{
            width: 64vw;
            margin: 0 auto;
            &::after{
                display: none;
            }
            .el-tabs__nav-scroll {
                padding: 0px 9px;
                .el-tabs__nav {
                    height: 56px;
                    align-items: center;
                    .el-tabs__active-bar {
                        height: 3px;
                        border-radius: 3px;
                        // box-shadow: 0 0 20px #000;
                        // background-color: #0099ff;
                        background-color: var(--el-color-primary-light-5);
                    }
                    .el-tabs__item {
                        font-size: 16px;
                        color: #ffffffcc;
                        text-shadow: 0 0 12px #666;
                        &.is-active {
                            color: #ffffff;
                        }
                    }
                }
            }
        }
    }
}
.nav-tabs-content {
    .el-carousel__container {
        .el-carousel__item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    }
}
.pop-wrapper {
    &::before {
        content: '';
        display: block;
        position: fixed;
        inset: 0;
        transition: opacity 300ms;
        pointer-events: none;
        backdrop-filter: blur(48px);
        opacity: 0;
    }
    &.pop-wrapper-background::before {
        pointer-events: unset;
        opacity: 1;
    }
}
</style>
