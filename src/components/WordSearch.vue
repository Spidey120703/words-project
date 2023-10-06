<script setup lang="ts">
import { Search, Clock, Close } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import WordCard from './WordCard.vue'
import { debounce } from './debounce';

const props = defineProps<{ wordData: Array<any>, listState?: boolean }>()
defineEmits(['inputFocus', 'inputBlur', 'cardClick'])


const keyword = ref('')
// const showList = ref(false)
const onTopClass = ref(false)
const showListClass = ref(false)

watch(() => props.listState, function () {
    // console.log(args)
    showListClass.value = false
});

const placeholderKeywords = ref<Array<any>>([])
const cardColumns = ref<{ left: Array<any>, right: Array<any> }>({
    left: [], right: []
})

let localHistory = localStorage.getItem('history-keywords')
const localHistoryArr = ref<string[]>([]);
// localHistory = 'history\0what\0shit'
if (localHistory != null) {
    localHistoryArr.value.push(...localHistory.split('\0').filter(e=>e.length))
    // placeholderKeywords.value.push(...(localHistoryArr.map(kw => {
    //     return {
    //         wordHead: kw,
    //         type: 'history'
    //     }
    // })))
}

function updateKeywordList(keyword: string = '', length: number = 10) {
    keyword = keyword.toLowerCase()
    placeholderKeywords.value = []
    placeholderKeywords.value.push(...localHistoryArr.value.filter(word => word.toLowerCase().startsWith(keyword)).map(word => Object.assign({type: 'history'}, props.wordData.filter(wordData => wordData.wordHead === word)[0])).slice(0, length))
    placeholderKeywords.value.push(...localHistoryArr.value.filter(word => placeholderKeywords.value.findIndex(e => e.wordHead === word) === -1 && word.toLowerCase().includes(keyword)).map(word => Object.assign({type: 'history'}, props.wordData.filter(wordData => wordData.wordHead === word)[0])).slice(0, length - placeholderKeywords.value.length))
    console.log(localHistoryArr.value)
    if (keyword.length > 0) {
        placeholderKeywords.value.push(...props.wordData.filter(word => placeholderKeywords.value.findIndex(e => e.wordHead === word.wordHead) === -1 && word.wordHead.toLowerCase().startsWith(keyword)).slice(0, length - placeholderKeywords.value.length))
        placeholderKeywords.value.push(...props.wordData.filter(word => placeholderKeywords.value.findIndex(e => e.wordHead === word.wordHead) === -1 && word.wordHead.toLowerCase().includes(keyword)).slice(0, length - placeholderKeywords.value.length))
    }
    if ([...keyword].some(c => c.charCodeAt(0) > 127)) {
        placeholderKeywords.value.push(...props.wordData.filter(word => placeholderKeywords.value.findIndex(e => e.wordHead === word.wordHead) === -1 && word.content.trans.some((t: any) => t.tranCn.includes(keyword))).slice(0, length - placeholderKeywords.value.length))
    }
    return placeholderKeywords.value.length
}

function updateWordCardList() {
    cardColumns.value.left = []
    cardColumns.value.right = []
    placeholderKeywords.value.forEach((e, i) => {
        (i % 2 == 0 ? cardColumns.value.left : cardColumns.value.right).push(e)
    })
}

watch(keyword, debounce(function (newValue: string) {
    onTopClass.value = newValue.length !== 0
    // props.wordData.map(word => console.log(word))
    showListClass.value = updateKeywordList(newValue) !== 0
    // showCardColumns(placeholderKeywords.value)
    updateWordCardList()
}, 400))
// historyKeywords.value = historyKeywords.value.filter(kw => kw.length)

function removeKeyword(event: MouseEvent, i: number) {
    let et: EventTarget | null = event.target

    while (et instanceof Element && !et.classList.contains('keyword-list-item')) {
        et = et.parentElement
    }
    if (et instanceof HTMLElement) {
        const el: HTMLElement = et
        el.style.height = '0'
        el.animate([
            { height: '36px' },
            { height: '0px' },
        ], { duration: 300 }).finished.then(() => {
            localHistoryArr.value.splice(localHistoryArr.value.indexOf(placeholderKeywords.value[i].wordHead), 1)[0]
            // console.log(placeholderKeywords.value)
            placeholderKeywords.value.splice(i, 1)
            el.style.removeProperty('height')
            updateKeywordList(keyword.value)
            updateWordCardList()
            localStorage.setItem('history-keywords', localHistoryArr.value.join('\0'))
        })
        // el.addEventListener('transitionend', () => {
        //     console.log(123)
        //     // el.remove()
        //     // historyKeywords.value = historyKeywords.value.filter(kw => kw !== el.children[1].textContent)
        // }, { once: true })
    }
}

function cardScrollHandler(e: UIEvent) {
    if (e.target instanceof HTMLElement) {
        const element = e.target,
            rect = element.getBoundingClientRect();
        for (let i = 0; i < element.children.length; i++) {
            for (let j = 0; j < element.children[i].children.length; j++) {
                const child = element.children[i].children[j] as HTMLElement, childRect = child.getBoundingClientRect()
                child.style.removeProperty("opacity")
                if (childRect.top === rect.top + 20) {
                    const next = child.nextElementSibling as HTMLElement, nextRect = next.getBoundingClientRect()
                    let offset = childRect.bottom - nextRect.top
                    if (offset > 0) {
                        child.style.opacity = `${1 - offset / childRect.height}`
                    }
                }
            }
        }
    }
}

function updateHistory(word: string) {
    const index = localHistoryArr.value.indexOf(word);
    if (index >= 0) {
        localHistoryArr.value.splice(index, 1)
    }
    localHistoryArr.value.unshift(word)
    localStorage.setItem('history-keywords', localHistoryArr.value.join('\0'))
}


</script>

<template>
    <!-- <el-input type="search" v-model="keyword" :suffix-icon="Search"></el-input> -->
    <div class="search-container" :class="{ 'on-top': onTopClass }">
        <div class="search-wrapper">
            <el-input class="search-input" type="search" v-model="keyword" size="large" placeholder="在此输入单词"
                @focus="$emit('inputFocus')" @blur="$emit('inputBlur')" @mousedown.stop="showListClass = updateKeywordList(keyword) !== 0">{{ keyword }}
                <template #append>
                    <el-button class="search-button" :icon="Search" size="large"></el-button>
                </template>
            </el-input>
            <!-- {{ historyKeywords }} -->
            <div class="keyword-list-box" :class="{ 'show-list': showListClass && placeholderKeywords.length !== 0 }">
                <div class="keyword-list-item"
                    @click="keyword = word, showListClass = false, updateHistory(word)"
                    @mousedown.stop v-for="{ type='normal', wordHead: word, content = {} }, i in placeholderKeywords">
                    <el-icon class="history-icon" v-if="type == 'history'">
                        <Clock />
                    </el-icon>
                    <!-- {{ console.log(content.syno === undefined ? content : 0) }} {{ content.trans }} -->
                    <el-text class="keyword" size="large">
                        <el-text class="eng" size="large">{{ word }}</el-text>
                        &nbsp;&nbsp;&nbsp;
                        <el-text class="chn" size="large">{{ content.trans !== undefined && content.trans.map((syno: any) =>
                            syno.pos + '.' + syno.tranCn).join('&nbsp;&nbsp;') }}</el-text>
                    </el-text>
                    <!-- <el-text class="keyword" size="large">{{ word }}&nbsp;&nbsp;{{ content.syno !== undefined && content.syno.synos.map((syno: any) => syno.pos + '.' + syno.tran).join('&nbsp;') }}</el-text> -->
                    <el-icon v-if="type == 'history'" @mousedown.stop @click.stop="(e: MouseEvent) => { removeKeyword(e, i) }"
                        class="close-icon">
                        <Close />
                    </el-icon>
                </div>
            </div>
        </div>
    </div>
    <div class="scroll-area" v-if="wordData.length" @scroll="cardScrollHandler">
        <div class="scroll-col" v-if="cardColumns.left.length">
            <WordCard @click="e => $emit('cardClick', e)" class="word-card" :wordData="word" v-for="word in cardColumns.left"></WordCard>
            <!--  :class="{'in-history': localHistoryArr.includes(word.wordHead)}" -->
        </div>
        <div class="scroll-col" v-if="cardColumns.right.length">
            <WordCard @click="e => $emit('cardClick', e)" class="word-card" :wordData="word" v-for="word in cardColumns.right"></WordCard>
        </div>
    </div>
</template>

<style lang="scss">
.search-container {
    // display: flex;
    // justify-content: center;
    width: 42vw;
    min-width: 320px;
    padding-top: 24vh;
    transition: padding-top 400ms;

    // padding: 26vh 12vw 8px;
    &.on-top {
        padding-top: 4px;
    }

    .search-wrapper {
        user-select: none;
        width: 100%;
        box-shadow: 0 0 0 1px black;
        border-radius: 24px;
        overflow: hidden;
        background-color: white;

        .search-input {
            .el-input__wrapper {
                border-radius: 48px 0 0 48px;
                box-shadow: none;
                padding-left: 18px;
            }

            .el-input-group__append {
                border-radius: 0 48px 48px 0;
                box-shadow: none;
                background-color: white;

                .el-button.search-button {
                    font-size: 24px;
                    display: flex;
                    padding-right: 24px;
                    border-left: 1px solid #ccc;
                    transition: color 400ms;

                    &:hover {
                        color: #ccc;
                    }

                    &:active {
                        color: #aaa;
                    }
                }
            }

            .el-input__inner {
                font-size: 18px;
            }
        }

        .keyword-list-box {
            transition: height 300ms, border-top 300ms;
            height: 0;
            border-top: 1px solid #fff;

            &.show-list {
                border-top: 1px solid #ccc;
                height: 360px;
            }

            .keyword-list-item {
                display: flex;
                align-items: center;
                height: 36px;
                padding: 0 16px;
                cursor: pointer;
                overflow: hidden;

                // transition: height 300ms;
                .history-icon {
                    padding-right: 10px;
                }

                .keyword {
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    width: 80%;
                    display: inline-block;
                    flex: 1;

                    .eng {
                        color: #333;
                    }

                    .chn {
                        color: #666;
                    }
                }

                .close-icon {
                    display: none;
                }

                &:hover {
                    background: #eee;

                    .close-icon {
                        display: unset;
                        transition: color 400ms;

                        &:hover {
                            color: #666;
                        }
                    }
                }
            }
        }
    }

    .el-input-group {
        height: 48px;
    }
}

// .scroll-area::-webkit-scrollbar {
// }
/* 整个滚动条 */
.scroll-area::-webkit-scrollbar {
    width: 4px;
    // display: none;
    background-color: #11111133;
    border-radius: 4px;
}

/* 滚动条上的滚动滑块 */
.scroll-area::-webkit-scrollbar-thumb {
    // background-color: #409effcc;
    background-color: #a0cfffcc;
    border-radius: 4px;
}

.scroll-area {
    display: flex;
    width: 68vw;
    justify-content: space-evenly;
    // position: relative;
    // z-index: -1;
    padding: 20px 0;
    margin: 20px 0;
    overflow-x: hidden;
    overflow-y: auto;

    .scroll-col {
        // display: flex;
        // flex-direction: column;
        // gap: 24px;
        // column-count: 2;
        height: fit-content;

        .word-card {
            position: sticky;
            top: 0;

            // break-inside: avoid;
            margin-bottom: 24px;
            // transition: inset 0.5s;

            /*
            overflow-x: hidden;

            &.in-history::after {
                content: '历史查询';
                text-align: center;
                display: block;
                background: #819fbe;
                box-shadow: 0 2px 4px #333;
                color: white;
                text-shadow: 0 0 1px black;
                height: 23px;
                width: 96px;
                position: absolute;
                top: 12px;
                right: -25px;
                transform: rotate(45deg);
            }
            */
        }
    }

    // @supports (-webkit-mask-image: unset) {
    //     -webkit-mask-image: -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(3%, #000000), color-stop(97%, #000000), to(transparent));
    // }
}

</style>
