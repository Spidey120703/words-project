<template>
    <div class="word-card">
        <h1 class="word">{{ wordData.wordHead }}</h1>
        <div class="phones">
            <el-tag size="large" class="api-read" round @mousedown.stop @click.stop="speak(wordData.wordHead, 1)">英 <span v-if="wordData.content.ukphone">/{{ wordData.content.ukphone }}/</span> <el-icon><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg></el-icon></el-tag>
            &nbsp;
            <el-tag size="large" class="api-read" round @mousedown.stop @click.stop="speak(wordData.wordHead, 2)">美 <span v-if="wordData.content.usphone">/{{ wordData.content.usphone }}/</span> <el-icon><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg></el-icon></el-tag>
        </div>
        <div class="word-trans">
            <el-row class="single-trans" v-for="trans in wordData.content.trans">
                <el-col class="trans-pos" :span="3">
                    <el-text tag="i" size="large">{{ trans.pos }}.</el-text></el-col>
                <el-col class="trans-cn" :span="21">
                    <el-text size="large">{{ trans.tranCn }}</el-text>
                </el-col>
                <template v-if="trans.tranOther">
                    <el-col class="trans-pos" :span="3">
                        <el-text tag="i" size="large"></el-text></el-col>
                    <el-col class="trans-other" :span="21">
                        <el-text tag="i">{{ trans.tranOther }}</el-text>
                    </el-col>
                </template>
            </el-row>
        </div>
        <div class="other-info">
            <div class="other-area" v-if="wordData.content.sentence">
                <h2 class="title">{{ wordData.content.sentence.desc }}</h2>
                <div class="other-container">
                    <el-row class="other-item" v-for="s, i in wordData.content.sentence.sentences">
                        <el-col class="order-num" :span="1">{{ i + 1 }}</el-col>
                        <el-col class="other-wrapper" :span="23">
                            <div class="english-sentence">
                                <el-text size="large" class="english-readable">{{ s.sContent }}</el-text>
                            </div>
                            <div class="chinese-sentence">
                                <el-text large="large">{{ s.sCn }}</el-text>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </div>
            <div class="other-area" v-if="wordData.content.phrase">
                <h2 class="title">{{ wordData.content.phrase.desc }}</h2>
                <div class="other-container">
                    <el-row class="other-item" v-for="p, i in wordData.content.phrase.phrases">
                        <el-col class="order-num" :span="1">{{ i + 1 }}</el-col>
                        <el-col class="other-wrapper" :span="23">
                            <div class="english-phrase">
                                <el-text size="large" class="english-readable">{{ p.pContent }}</el-text>
                            </div>
                            <div class="chinese-phrase">
                                <el-text large="large">{{ p.pCn }}</el-text>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </div>
        </div>
    </div>
</template>
    
<script lang='ts'>
import { defineComponent } from 'vue'

const audio = new Audio()

export default defineComponent({
    props: {
        wordData: {
            type: Object, 
            required: true
        }
    },
    setup() {
        return {}
    }, 
    methods: {
        speak(word: string, type: 1 | 2) {
            audio.src = `https://dict.youdao.com/dictvoice?audio=${word}&type=${type}`
            audio.play();
        }
    }
})
</script>
    
<style lang="scss">
@keyframes card-ease-in {
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0px);
    }
}

.word-card::-webkit-scrollbar {
    width: 4px;
    background-color: #11111133;
    border-radius: 4px;
}
.word-card::-webkit-scrollbar-thumb {
    background-color: #a0cfffcc;
    border-radius: 4px;
}
.word-card {
    overflow-y: auto;
    animation: card-ease-in 800ms;
    backdrop-filter: blur(48px);
    border-radius: 24px;
    background-color: #00000044;
    width: 28vw;
    padding: 24px;
    user-select: none;
    box-shadow: 0px 0px 0px #66666666;
    transition: box-shadow 300ms;
    &:hover {
        box-shadow: 2px 4px 12px #33333366;
    }
    .word {
        margin: 0 0 12px;
        color: var(--el-color-warning);
        text-shadow: 0 0 2px #666;
    }
    .phones {
        margin-bottom: 16px;
        .api-read {
            box-shadow: 0 0 2px #333;
            background: #cccccc44;
            backdrop-filter: blur(12px);
            border-width: 0;
            color: #ccc;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 300ms;
            &:hover {
                background: #cccccc66;
            }
            &:active {
                background: #cccccc44;
            }
            .el-icon {
                vertical-align: top;
            }
        }
    }
    .word-trans {
        .single-trans {
            margin: 6px 0;

            .trans-pos {
                max-width: 64px;
                flex: 0 0 64px;

                .el-text {
                    color: #fff;
                    font-family: "Times New Roman", Times, serif;
                    text-shadow: 1px 1px 3px #333;
                }
            }
            .trans-cn, .trans-other {
                max-width: calc(100% - 64px);
                flex: 0 0 calc(100% - 64px);
                .el-text {
                    color: #ccc;
                    word-break: break-word;
                }
            }
        }
    }
    .other-info {
        display: none;
        .el-text {
            word-break: break-word;
        }
        &.show-info {
            display: block;
            animation: card-ease-in 800ms;
        }
        .english-readable {
            cursor: pointer;
        }
        .other-area {
            .title {
                margin: 24px 0 4px;
                font-weight: normal;
                color: #00aaff;
                text-shadow: 0 0 2px #363636;
            }
            .other-item {
                width: 100%;
                padding: 6px 0;
                
                .order-num {
                    color: #cecece;
                    font-size: 18px;
                    padding-top: 2px;
                    font-family: 'Times New Roman', Times, serif;
                    font-weight: bold;
                    text-shadow: 0 0 6px #363636;
                }
                .other-wrapper {
                    padding: 0 0 0 8px;
                    .english-sentence, .english-phrase {
                        .el-text {
                            color: #fefefe;
                            font-size: 18px;
                        }
                    }
                    .english-phrase > .el-text {
                        color: var(--el-color-primary-light-3);
                        font-weight: bold;
                    }
                    .chinese-sentence, .chinese-phrase {
                        .el-text {
                            color: #ccc;
                        }
                    }
                }
            }
        }
    }
}
</style>