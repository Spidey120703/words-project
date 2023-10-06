<script setup lang="ts">
import CryptoJS from 'crypto-js'
import { ElCarousel, ElMessageBox, ElNotification, ElTable, UploadUserFile } from 'element-plus'
import { Tools, CloseBold, Close, Back } from '@element-plus/icons-vue'
import { h, nextTick, ref, watch } from 'vue'
import axios from 'axios'

const wordList = ref<Array<any>>([])

const dictData = ref<{
    builtin: boolean,
    label: string,
    value: string,
    data: Array<any>,
    url?: string
}>({ builtin: false, label: '', value: '', data: [] })


// const tableData = ref<any[]>([])
enum WordState {
    None = 0x00,
    Tried = 0x01,
    Correct = 0x02,
    Incorrect = 0x04,
    Hinted = 0x08,
    Done = 0x80
}
function generateList(size: number, mode: string | null = null) {
    wordList.value = []
    if (mode === null) {
        for (let i = 0, j = 0; i < dictData.value.data.length && j < Math.min(100, size); i ++) {
            if (!memorizedWords.includes(dictData.value.data[i].wordHead)) {
                // console.log(memorizedWords, dictData.value.data[i].wordHead)
                wordList.value.push(Object.assign({
                    letters: [],
                    flag: WordState.None, 
                    errorCount: 0
                }, dictData.value.data[i]))
                j ++;
            }
        }
    } else if (mode == 'review') {
        for (let i = 0, j = -1, k = -1; i < Math.min(Math.min(100, dictData.value.data.filter(e=>memorizedWords.includes(e.wordHead)).length), size); ) {
            k = Math.floor(Math.random() * memorizedWords.length)
            j = dictData.value.data.findIndex((e: any) => memorizedWords[k] == e.wordHead)
            // console.log(dictData.value.data, j, k, memorizedWords[k])
            if (j >= 0 && wordList.value.findIndex(e=>e.wordHead == dictData.value.data[j].wordHead) == -1) {
                // console.log(memorizedWords, dictData.value.data[i].wordHead)
                wordList.value.push(Object.assign({
                    letters: [],
                    flag: WordState
                }, dictData.value.data[j]))
                i ++
            }
        }
    }
    // tableData.value = []
    // wordList.value.forEach(w => {
    //     tableData.value.push({ word: w.wordHead, mean: w.content.trans.map((t: any) => t.pos + '. ' + t.tranCn) })
    // })
}

const dictionaries = ref<any>([
    { builtin: true, value: 'CET-4', label: '大学英语四级词汇（3739词）', data: [], url: 'CET4_2.json' },
    { builtin: true, value: 'CET-6', label: '大学英语六级词汇（2078词）', data: [], url: 'CET6_2.json' },
    { builtin: true, value: 'TEM-4', label: '英语专业四级词汇（4025词）', data: [], url: 'Level4_2.json' },
    { builtin: true, value: 'TEM-8', label: '英语专业八级词汇（12197词）', data: [], url: 'Level8_2.json' },
    { builtin: true, value: 'KaoYan', label: '考研英语词汇（4533词）', data: [], url: 'KaoYan_2.json' },
    { builtin: true, value: 'IELTS', label: '雅思英语词汇（3427词）', data: [], url: 'IELTS_2.json' },
    { builtin: true, value: 'TOEFL', label: '托福英语词汇（9213词）', data: [], url: 'TOEFL_2.json' },
])


const chosenDictionary = ref<string>('CET-4')
const root = process.env.NODE_ENV == 'development' ? '/src' : ''
function downDict(filename: string) {
    axios.get(`.${root}/assets/data/${filename}`).then((res) => {
        if (res.data) {
            dictData.value.data = res.data.trim().split('\n').map((line: string) => JSON.parse(line).content.word)
            localStorage.setItem('dictionary-data', JSON.stringify(Object.assign(Object.assign({}, dictData.value), { data: [] })))
        }
    })
}
function setDictData(index: number) {
    chosenDictionary.value = dictionaries.value[index].value
    dictData.value = dictionaries.value[index]
    console.log(dictData.value)
    if (dictData.value.builtin && dictData.value.data.length === 0 && dictData.value.url) {
        downDict(dictData.value.url)
    } else {
        localStorage.setItem('dictionary-data', JSON.stringify(Object.assign(Object.assign({}, dictData.value), { data: [] })))
    }
}

const dictDataStorage: string = localStorage.getItem('dictionary-data') || ''
if (dictDataStorage?.length > 0) {
    dictData.value = JSON.parse(dictDataStorage)
    chosenDictionary.value = dictData.value.value
    if (dictData.value.data.length === 0) {
        if (dictData.value.url !== undefined) {
            downDict(dictData.value.url)
        }
    }
} else {
    setDictData(0);
}

function asyncNumber() {
    if (dictCarousel.value !== null) {

        const indicators = dictCarousel.value.$el.querySelector('.el-carousel__indicators');
        [...indicators.children].forEach((e: HTMLElement, i: number) => {
            if (e.children[e.childElementCount - 1].tagName === 'DIV') {
                e.removeChild(e.childNodes[e.childElementCount - 1]);
            }
            const div = document.createElement('div')
            div.classList.add('num-indicator')
            div.innerText = `${i + 1}`
            e.appendChild(div)
        })
    }
}

const dictCarousel = ref<typeof ElCarousel | null>(null)
let index: number = 0

function keyInput(e: KeyboardEvent) {
    if (e.key == 'ArrowLeft') {
        if (dictCarousel.value !== null) {
            dictCarousel.value.prev()
        }
        return
    } else if (e.key == 'ArrowRight') {
        if (dictCarousel.value !== null) {
            dictCarousel.value.next()
        }
        return
    } else if (e.key == 'ArrowUp') {
        if (dictCarousel.value !== null) {
            dictCarousel.value.setActiveItem(Math.max(0, index - 20))
        }
        return
    } else if (e.key == 'ArrowDown') {
        if (dictCarousel.value !== null) {
            dictCarousel.value.setActiveItem(Math.min(wordList.value.length, index + 20))
        }
        return
    } else if (e.key == '1') {
        if (dictCarousel.value !== null) {
            speak(wordList.value[index].wordHead, 2)
            e.preventDefault()
        }
        return
    } else if (e.key == '2') {
        if (dictCarousel.value !== null && testMode.value != '默写模式') {
            showCurWord()
            speak(wordList.value[index].wordHead, 2)
            e.preventDefault()
        }
        return
    } else if (e.key == 'Escape') {
        e.stopImmediatePropagation()
        e.preventDefault()
        goBack()
    }
    // console.log(e.key)
    const wItem = wordList.value[index]
    if (!(wItem.flag & WordState.Done)) {
        const letters = wItem.letters
        if (letters == null) return
        if (testMode.value == '默写模式' && e.key == 'Enter') {
            // console.log(wItem)
            if (letters.join('').replace('&nbsp;', ' ') == wItem.wordHead) {
                if (wItem.flag & WordState.Tried) {
                    wItem.flag ^= WordState.Tried
                }
                wItem.flag |= WordState.Correct
                wItem.flag |= WordState.Done
                setTimeout(() => {
                    if (dictCarousel.value !== null) {
                        if (wordList.value.filter(e => (e.flag & WordState.Done)).length === wordList.value.length) {
                            resultMode.value = true
                            nextTick(() =>
                                dictCarousel.value!.setActiveItem(wordList.value.length)
                            );
                            return
                        }
                        let i = index
                        do {
                            if (!(wordList.value[i].flag & WordState.Done)) {
                                dictCarousel.value.setActiveItem(i);
                                break;
                            }
                            i = (i + wordList.value.length + 1) % wordList.value.length;
                        } while (i != index)
                    }
                }, 200)
            } else {
                wItem.flag |= WordState.Incorrect
                wItem.errorCount ++
            }
        } else if (wItem.flag & WordState.Incorrect) {
            wItem.flag ^= WordState.Incorrect
            letters.splice(0)
        }
        // console.log(e.keyCode)
        if (letters.length < 128 && e.key.length === 1 && !e.code.startsWith('Numpad')
            && (e.keyCode == 0x20 || e.keyCode == 189 || (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 97 && e.keyCode <= 122))) {
            if (!(wItem.flag & WordState.Done)) {
                wItem.flag |= WordState.Tried
            }
            if (e.key == ' ') {
                if (letters.length > 0 && letters[letters.length - 1] != '&nbsp;') {
                    letters.push('&nbsp;')
                }
            } else {
                letters.push(e.key)
            }
            if (testMode.value != '默写模式' && letters.join('').replace('&nbsp;', ' ') != wItem.wordHead
                && letters.length == wItem.wordHead.length && dictCarousel.value !== null) {
                dictCarousel.value.$el.animate([
                    { transform: 'scale(1) rotate(0deg)' },
                    { transform: 'scale(.95) rotate(1deg)' },
                    { transform: 'scale(.95) rotate(-1deg)' },
                    { transform: 'scale(1) rotate(0deg)' }
                ], { duration: 250 })
            }
        } else if (e.keyCode == 8) {
            if (e.ctrlKey) {
                letters.splice(0, letters.length)
            } else {
                letters.pop()
            }
        }
        if (testMode.value != '默写模式' && letters.join('').replace('&nbsp;', ' ') == wItem.wordHead) {
            if (wItem.flag & WordState.Tried) {
                wItem.flag ^= WordState.Tried
            }
            wItem.flag |= WordState.Done
            setTimeout(() => {
                if (dictCarousel.value !== null) {
                    if (wordList.value.filter(e => (e.flag & WordState.Done)).length === wordList.value.length) {
                        resultMode.value = true
                        nextTick(() =>
                            dictCarousel.value!.setActiveItem(wordList.value.length)
                        );
                        // console.log(1)
                        return
                    }
                    // dictCarousel.value.next()
                    let i = index
                    do {
                        // console.log(i, wordList.value[i])
                        if (!(wordList.value[i].flag & WordState.Done)) {
                            dictCarousel.value.setActiveItem(i);
                            break;
                        }
                        i = (i + wordList.value.length + 1) % wordList.value.length;
                    } while (i != index)
                }
            }, 200)
        }
    }
}
function updateIndicator() {
    if (dictCarousel.value !== null && wordList.value !== null) {
        const indicators = dictCarousel.value.$el.querySelector('.el-carousel__indicators')
        if (resultMode.value && indicators.children[indicators.childElementCount - 1].classList.contains('is-active')) {
            indicators.style.display = 'none'
            return
        }
        indicators.style.removeProperty('display')
        for (let i = 0; i < wordList.value.length; i++) {
            const wItem = wordList.value[i];
            if (wItem.flag & WordState.Done) {
                indicators.children[i].children[0].style.backgroundColor = wItem.flag & WordState.Hinted ? 'var(--el-color-primary-light-3)' : 'var(--el-color-success-light-3)'
            } else if (wItem.flag & WordState.Incorrect) {
                indicators.children[i].children[0].style.backgroundColor = 'var(--el-color-error-light-3)'
            } else if (wItem.flag & WordState.Tried) {
                indicators.children[i].children[0].style.backgroundColor = 'var(--el-color-warning-light-3)'
            } else {
                indicators.children[i].children[0].style.removeProperty('background-color')
            }
            if (indicators.children[i].classList.contains('is-active')) {
                indicators.children[i].children[0].style.removeProperty('background-color')
            }
        }
    }
}
function carouselChange(newIndex: number) {
    if (dictCarousel.value !== null && newIndex < wordList.value.length) {
        index = newIndex
    }
    nextTick(updateIndicator)
}
const audio = new Audio()
function speak(word: string, type: 1 | 2) {
    // new Audio(`https://dict.youdao.com/dictvoice?audio=${word}&type=${type}`)
    audio.src = `https://dict.youdao.com/dictvoice?audio=${word}&type=${type}`
    audio.play();
}

const doShowConfig = ref<boolean>(false)
function showConfig(e: MouseEvent) {
    if (e.button == 0) {
        doShowConfig.value = true
    }
}

function closeConfig(e: MouseEvent) {
    if (e.button == 0) {
        doShowConfig.value = false
    }
}

const wordCount = ref<number>(20);
const testMode = ref<string>('记忆模式');

function getOrdinalNumber(num: number = 0) {
    const string_map = ['st', 'nd', 'th'];
    return `${num}${Math.floor(num / 10) == 1 ? string_map[2] : string_map[num % 10] || string_map[2]}`
}

const MonthString: Array<string> = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WeekdayString: Array<string> = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const memorizedWords: Array<string> = (localStorage.getItem('memorized-words') || '').split('\0').filter(s => s.length)
// console.log(memorizedWords)

const date = ref<Date>(new Date())
setInterval(() => {
    date.value = new Date()
}, 100)

const showContainer = ref<boolean>(false)
const hideContainer = ref<boolean>(false)

function startDictation() {
    if (dictData.value.data.length == 0) {
        ElNotification({
            title: '警告',
            message: h('span', { style: 'color: var(--el-color-error)' }, '词典中的单词不存在，请在设置中更换其他词典。'),
            type: 'error',
        })
        return;
    }
    if (dictCarousel.value != null) {
        dictCarousel.value.setActiveItem(0)
        showContainer.value = true
        hideContainer.value = true
        generateList(wordCount.value, testMode.value === '复习模式' ? 'review' : null)
        nextTick(asyncNumber)
        resultMode.value = false
    }
}

const fileList = ref<UploadUserFile[]>([])

function changeDict(e: string) {
    const index = dictionaries.value.findIndex((i: any) => i.value === e)
    if (index >= 0) {
        setDictData(index)
        nextTick(updateIndicator)
    }
}
function dictionaryUpload(data: any) {
    if (data.status === 'ready') {
        axios.get(URL.createObjectURL(data.raw)).then((res) => {
            if (res.data) {
                const words = res.data.trim().split('\n').map((line: string) => JSON.parse(line).content.word)
                dictionaries.value.unshift({
                    value: data.name,
                    label: `${data.name}（${words.length}词）`,
                    data: words
                })
                // console.log(dictionaries.value)
            }
        })
    }
}
function removeDict(i: number) {
    dictionaries.value.splice(i, 1)
}

function goBack() {
    if (resultMode.value == false) {
        ElMessageBox.confirm('你确定要退出吗？本次测试将不保留结果。', '警告', {
            confirmButtonText: '确认退出',
            cancelButtonText: '取消退出',
            type: 'warning',
        }).then(() => {
            if (dictCarousel.value != null) {
                dictCarousel.value.$el.animate([
                    { opacity: 1 },
                    { opacity: 0 },
                ], { duration: 300 }).finished.then(() => {
                    showContainer.value = false
                })
                hideContainer.value = false
            }
        }).catch(() => {
        })
    } else {
        if (dictCarousel.value != null) {
            dictCarousel.value.$el.animate([
                { opacity: 1 },
                { opacity: 0 },
            ], { duration: 300 }).finished.then(() => {
                showContainer.value = false
                // dictCarousel.value!.$el.querySelector('.el-carousel__indicators').style.removeProperty('display')
                resultMode.value = false
                wordList.value!.map(e => e.flag = WordState.None)
                nextTick(updateIndicator)
            })
            hideContainer.value = false
        }
    }
}

const resultMode = ref(false);

function showCurWord() {
    if (dictCarousel.value !== null && index < wordList.value.length) {
        wordList.value[index].letters = wordList.value[index].wordHead.split('').map((c: string) => c == ' ' ? 'nbsp;' : c)
        if (wordList.value[index].flag & WordState.Tried) {
            wordList.value[index].flag ^= WordState.Tried
        }
        wordList.value[index].flag |= WordState.Done | WordState.Hinted
        if (wordList.value.filter(e => (e.flag & WordState.Done)).length === wordList.value.length) {
            resultMode.value = true
            nextTick(() =>
                dictCarousel.value!.setActiveItem(wordList.value.length)
            )
            // console.log(1)
            return
        }
    }
}

let flagFilter = ref<WordState>(WordState.None)

function changeFilter(flag: WordState) {
    if (flag === flagFilter.value) {
        flagFilter.value = WordState.None
    } else {
        flagFilter.value = flag
    }
    resultTable.value!.toggleAllSelection();
}

const resultTable = ref<InstanceType<typeof ElTable>>();

watch(resultTable, function (value) {
    if (value !== null) {
        value!.toggleAllSelection();
    }
});

let exportWords: any[] = [];

function handleSelectionChange(rows: Array<any>) {
    exportWords = rows
}

function exportWordsFile() {
    // console.log();
    // console.log(exportWords);
    const content = exportWords.map(w=>w.wordHead+'\n'+w.content.trans.map((e: any)=>e.pos + '. ' + e.tranCn).join('  ')).join('\n\n')
    const date_str = ((d) => 
        d.getFullYear().toString().slice(2)  + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0') + 
        d.getHours().toString().padStart(2, '0')  + d.getMinutes().toString().padStart(2, '0') + d.getSeconds().toString().padStart(2, '0'))(new Date())
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(
        [ content ], 
        { type: 'text/plain' }))
    a.setAttribute('target', '_blank')
    a.setAttribute('download', `dict-${CryptoJS.MD5(content).toString().slice(12, 20)}-${date_str}.txt`)
    a.click()
}

function resetMode() {
    testMode.value = ''
    nextTick(() => { testMode.value = '记忆模式' })
}

function joinMemorizedWords() {
    memorizedWords.push(...exportWords.filter(e=>memorizedWords.indexOf(e.wordHead) == -1).map(e=>e.wordHead))
    localStorage.setItem('memorized-words', memorizedWords.join('\0'))
    nextTick(resetMode)
    // console.log(memorizedWords)
    
    ElNotification({
        title: '成功',
        message: h('span', { style: 'color: var(--el-color-success)' }, `已成功将选中的 ${exportWords.length} 个词汇添加至复习词汇中。`),
        type: 'success',
    })
}

function deleteMemorizedWords() {
    memorizedWords.push(...exportWords.filter(e=>memorizedWords.indexOf(e.wordHead) == -1).map(e=>e.wordHead))
    exportWords.forEach(e => {
        const index = memorizedWords.indexOf(e.wordHead)
        if (index > -1) {
            memorizedWords.splice(index, 1)
        }
    })
    localStorage.setItem('memorized-words', memorizedWords.join('\0'))
    nextTick(resetMode)
    // console.log(memorizedWords)
    
    ElNotification({
        title: '成功',
        message: h('span', { style: 'color: var(--el-color-success)' }, `已成功将选中的 ${exportWords.length} 个词汇从复习词汇中移除。`),
        type: 'success',
    })
}

function memorizedUpload(data: any) {
    if (data.status === 'ready') {
        axios.get(URL.createObjectURL(data.raw)).then((res) => {
            if (res.data) {
                const words = res.data.trim().split('\n')
                const importWords = words.filter((e: string)=>memorizedWords.indexOf(e) == -1).map((e: string)=>e)
                memorizedWords.push(...importWords)
                localStorage.setItem('memorized-words', memorizedWords.join('\0'))
                resetMode()
                
                if (importWords.length == 0) {
                    ElNotification({
                        title: '警告',
                        message: h('span', { style: 'color: var(--el-color-error)' }, `没有导入任何新的复习词汇。`),
                        type: 'error',
                    })
                } else {
                    ElNotification({
                        title: '成功',
                        message: h('span', { style: 'color: var(--el-color-success)' }, `成功导入了 ${importWords.length} 个复习词汇。`),
                        type: 'success',
                    })
                }
            }
        })
    }
}

function clearMemorized() {
    ElMessageBox.confirm('你确定要清空复习词汇吗？清空后无法撤回。', '警告', {
        confirmButtonText: '确认清空',
        cancelButtonText: '取消清空',
        type: 'warning',
    }).then(() => {
        memorizedWords.splice(0)
        localStorage.setItem('memorized-words', memorizedWords.join('\0'))
        resetMode()
    
        ElNotification({
            title: '成功',
            message: h('span', { style: 'color: var(--el-color-success)' }, '成功清空复习词汇。'),
            type: 'success',
        })
    }).catch(() => {
    })
}

function downloadMemorized() {
    if (memorizedWords.length === 0) {
        ElNotification({
            title: '警告',
            message: h('span', { style: 'color: var(--el-color-error)' }, '复习词汇中暂无单词。'),
            type: 'error',
        })
        return;
    }
    const content = memorizedWords.join('\n')
    const date_str = ((d) => 
        d.getFullYear().toString().slice(2)  + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0') + 
        d.getHours().toString().padStart(2, '0')  + d.getMinutes().toString().padStart(2, '0') + d.getSeconds().toString().padStart(2, '0'))(new Date())
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(
        [ content ], 
        { type: 'text/plain' }))
    a.setAttribute('target', '_blank')
    a.setAttribute('download', `review-${CryptoJS.MD5(content).toString().slice(12, 20)}-${date_str}.txt`)
    a.click()
}
</script>

<template>
    <div class="initial-area" :class="{ 'hide-container': hideContainer }">
        <div class="initial-button" :class="{ 'config-pop-in': doShowConfig }">
            <div class="status">《{{ dictData.value }}》词汇共有 {{ dictData.data.length }} 词，当前已记忆 {{ memorizedWords.length }}
                词，还剩下 {{
                    dictData.data.filter(e=>!memorizedWords.includes(e.wordHead)).length }} 词。</div>
            <div class="date">
                <div class="time" :style="{
                    '--milliseconds-async': `${date.getMilliseconds() % 1000}ms`
                }">{{ date.getHours().toFixed().padStart(2, '0') }}<span>:</span>{{
    date.getMinutes().toFixed().padStart(2, '0') }}<span>:</span>{{ date.getSeconds().toFixed().padStart(2,
        '0') }}</div>
                <div class="year">{{ date.getFullYear() }}</div>
                <div class="month-day">{{ getOrdinalNumber(date.getDate()) }} {{ MonthString[date.getMonth()] }}</div>
                <div class="weekday">{{ WeekdayString[date.getDay()] }}</div>
                <div class="date-tips">距离英语四级考试还有 <el-text tag="b" size="large" type="primary">{{ Math.ceil((new
                    Date('2023-12-16').valueOf() - date.valueOf()) / 1000 / 60 / 60 / 24) }}</el-text> 天</div>
            </div>
            <div class="action-buttons">
                <el-button class="start-button" size="large" @click="startDictation">开&nbsp;始&nbsp;今&nbsp;天&nbsp;的&nbsp;{{
                    testMode.charAt(0) || '记' }}&nbsp;{{ testMode.charAt(1) || '忆' }}</el-button>
                <el-button class="config-button" size="large"
                    @click="(e: MouseEvent) => (doShowConfig ? closeConfig : showConfig)(e)"><el-icon>
                        <CloseBold v-if="doShowConfig" />
                        <Tools v-else />
                    </el-icon></el-button>
            </div>

            <div class="config-div">
                <div class="config-body">
                    <div class="config-form">
                        <label for="test-mode">词典</label>
                        <div class="config-input">
                            <el-select @change="changeDict" v-model="chosenDictionary" placeholder="请选择词典" size="large">
                                <el-option v-for="item, index in dictionaries" :key="item.value" class="select-option"
                                    :value="item.value">
                                    {{ item.label }}
                                    <el-icon v-if="!item.builtin" @mousedown.stop @click.stop="removeDict(index)"
                                        class="close-icon">
                                        <Close />
                                    </el-icon>
                                </el-option>
                            </el-select>
                            <el-upload v-model:file-list="fileList" class="dictionary-upload" :auto-upload="false"
                                list-type="text" :show-file-list="false" @change="dictionaryUpload"
                                accept="text/plain, application/json">
                                <el-button type="primary">点击上传词典</el-button>
                            </el-upload>
                        </div>
                    </div>
                    <div class="config-form">
                        <label for="word-length">单词数量</label>
                        <div class="config-input">
                            <el-input-number id="word-length" v-model="wordCount" :step="5" step-strictly :min="5"
                                :max="100" />
                            <div class="text-tips">预计 {{ Math.ceil((dictData.data.length - memorizedWords.length) /
                                wordCount)
                            }} 天左右背完。</div>
                        </div>
                    </div>
                    <div class="config-form">
                        <label for="test-mode">模式</label>
                        <div class="config-input">
                            <el-radio-group id="test-mode" v-model="testMode">
                                <el-radio-button label="记忆模式" />
                                <el-radio-button label="默写模式" />
                                <el-radio-button :disabled="memorizedWords.length == 0" label="复习模式" />
                            </el-radio-group>
                        </div>
                    </div>
                    <div class="config-form">
                        <label>复习管理</label>
                        <div class="config-input memorized-config">
                            <el-button type="primary" @click="clearMemorized">清空复习词汇</el-button>
                            <el-upload class="memorized-upload" :auto-upload="false"
                            list-type="text" :show-file-list="false" @change="memorizedUpload"
                            accept="text/plain">
                                <el-button type="primary">上传复习词汇</el-button>
                            </el-upload>
                            <el-button type="primary" @click="downloadMemorized">下载复习词汇</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <el-carousel ref="dictCarousel" height="100%" class="word-container" :class="{ 'show-container': showContainer }"
        :autoplay="false" :loop="false" @change="carouselChange" tabindex="0" @keydown="keyInput" trigger="click">
        <div class="go-back"><el-icon @click="goBack">
                <Back />
            </el-icon></div>
        <el-carousel-item v-for="wItem, i in wordList">
            <div class="dictation-word-num">{{ i + 1 }}/{{ wordList.length }}</div>
            <div class="dictation-main-body" :data-index="i">
                <div class="word-wrapper">
                    <div class="letter-wrapper">
                        <div class="word-letter" :class="[testMode == '默写模式' && !(wItem.flag & WordState.Incorrect) && !(wItem.flag & WordState.Done) ? '' : wItem.wordHead.charAt(i) === a ? 'correct-letter' : 'error-letter']"
                            v-for="a, i in wItem.letters" v-html="a"></div>
                        <!-- <div class="word-letter">e</div> -->
                        <div class="word-letter input-cursor" v-if="!(wItem.flag & WordState.Done)">_</div>
                    </div>
                </div>
                <div class="word-answer" v-if="testMode == '默写模式' && wItem.flag & WordState.Incorrect">
                    <div class="word-letter origin-letter">{{ wItem.wordHead }}</div>
                </div>
                <div class="meaning-container" v-else :class="{ 'perfect-hidden': false }">
                    <ul class="meaning-wrapper">
                        <li class="meaning-single" v-for="trans in wItem.content.trans"><el-text tag="i" size="large"
                                class="part-of-speech">{{ trans.pos }}.</el-text> {{ trans.tranCn }}</li>
                        <!-- <li class="meaning-single"><el-text tag="i" size="large" class="part-of-speech">a.</el-text> 常规的；例行的；惯常的</li> -->
                    </ul>
                    <template v-if="testMode != '默写模式'">
                        <div class="dictation-tips">
                            <el-tag size="large" class="api-read" round @click.stop="speak(wItem.wordHead, 2)"><el-icon
                                    size="large"><svg xmlns="http://www.w3.org/2000/svg" height="1em"
                                        viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                                        <path
                                            d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" />
                                    </svg></el-icon></el-tag>
                        </div>
                        <div class="answer-tips">
                            <el-button @click="showCurWord(), speak(wItem.wordHead, 2)"
                                :style="{ 'opacity': wItem.flag & WordState.Done ? 0 : 1, 'pointer-events': wItem.flag & WordState.Done ? 'none' : 'unset' }">查看单词</el-button>
                        </div>
                    </template>
                </div>
            </div>
        </el-carousel-item>
        <el-carousel-item v-if="resultMode" class="result-carousel-item">
            <div class="result-table">
                <el-table ref="resultTable" :data="wordList.filter(w => flagFilter == WordState.None || w.flag == flagFilter)"
                    style="width: 100%" height="calc(80vh - 128px)" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" />
                    <el-table-column type="index" />
                    <el-table-column prop="wordHead" label="单词" width="150">
                        <template #default="scope">
                            <div class="table-word-col" @click="speak(scope.row.wordHead, 2)">{{ scope.row.wordHead }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="释义">
                        <template #default="scope">
                            <div v-for="t in scope.row.content.trans">{{ t.pos }}. {{ t.tranCn }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="testMode == '默写模式'" label="错误次数" prop="errorCount" align="center" width="80"></el-table-column>
                    <el-table-column label="状态" fixed="right" width="120" align="center" header-align="center">
                        <template #default="scope">
                            <el-tag class="table-status-col"
                                :type="scope.row.flag & WordState.Hinted ? 'warning' : scope.row.flag & WordState.Correct ? 'success' : scope.row.flag & WordState.Incorrect ? 'danger' : ''"
                                effect="dark" round @click="changeFilter(scope.row.flag)">
                                {{ scope.row.flag & WordState.Hinted ? '提示' : scope.row.flag & WordState.Incorrect ? '错误' :
                                    '正确' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="table-control-buttons">
                    <el-button @click="exportWordsFile">导出这些单词的词典文件</el-button>
                    <el-button @click="joinMemorizedWords">将这些单词存入熟词列表</el-button>
                    <el-button @click="deleteMemorizedWords">从熟词列表移除这些单词</el-button>
                </div>
            </div>
        </el-carousel-item>
        <div class="total-progress" v-if="!resultMode">
            <div class="progress-tips"><el-text size="small" type="success" tag="b">{{ wordList.filter(e => e.flag &
                WordState.Done).length
            }}</el-text>/<el-text size="small" type="primary" tag="b">{{ wordList.filter(e => !(e.flag &
    WordState.Done)).length
}}</el-text></div>
            <el-progress
                :percentage="wordList.length === 0 ? 0 : wordList.filter(e => (e.flag & WordState.Done)).length / wordList.length * 100"
                :show-text="false" :stroke-width="3"></el-progress>
        </div>
    </el-carousel>
    <!-- </div> -->
</template>

<style lang="scss">

.perfect-hidden {
    opacity: 0;
    pointer-events: none;
}

.el-select-dropdown {
    .select-option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px 0 20px;

        .close-icon {
            transform: translateX(32px);
            transition: transform 160ms;
        }

        &.hover {
            .close-icon {
                transform: translateX(0px);
            }
        }
    }
}

.initial-area {
    width: 64vw;
    height: 85vh;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    // margin-top: 10vh;

    &.hide-container {
        @keyframes hiding-animation {
            from {
                opacity: 1;
            }

            to {
                opacity: 0;
            }
        }

        animation: hiding-animation 800ms forwards;
        pointer-events: none;
    }

    .initial-button {
        padding: 24px;
        width: 592px;
        height: 432px;
        backdrop-filter: blur(48px);
        background-color: #00000044;
        border-radius: 30px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        // margin-bottom: 150px;
        overflow: hidden;

        &.config-pop-in {
            .status {
                transform: translateY(-320px);
            }

            .date {
                transform: translateY(-320px);
            }

            .action-buttons {
                transform: translateY(-386px);
            }

            .config-div {
                transform: translateY(0px);
                top: 64px;
            }

        }

        .status {
            position: absolute;
            top: 14px;
            left: 14px;
            right: 14px;
            text-align: center;
            font-size: 12px;
            color: #ccc;
            text-shadow: 0 0 3px #333;
            transform: translateY(0px);
            transition: transform 300ms;
        }

        .date {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            color: white;
            text-shadow: 1px 1px 8px #333;
            text-align: center;
            transform: translateY(0px);
            transition: transform 300ms;

            .time {
                font-size: 24px;
                font-family: 'Courier New', Courier, monospace;
                --milliseconds-async: 0ms;

                span {
                    @keyframes ticktock {
                        from {
                            opacity: 0;
                        }

                        to {
                            opacity: 1;
                        }
                    }

                    font-family:'Gill Sans',
                    'Gill Sans MT',
                    Calibri,
                    'Trebuchet MS',
                    sans-serif;
                    animation-delay: var(--milliseconds-async);
                    animation: ticktock 500ms infinite alternate;
                }
            }

            .year {
                font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                font-weight: bold;
                font-size: 36px;
            }

            .month-day {
                font-size: 16px;
            }

            .weekday {
                font-size: 24px;
                font-family: 'Times New Roman', Times, serif;
                font-weight: bold;
            }

            .date-tips {
                margin-top: 8px;

                b {
                    color: var(--el-color-primary-light-3);
                }
            }
        }

        .action-buttons {
            display: flex;
            gap: 22px;
            transform: translateY(0px);
            transition: transform 300ms;

            .start-button,
            .config-button {
                box-shadow: 0 0 2px #333;
                background: #eeeeee66;
                backdrop-filter: blur(12px);
                border-width: 0;
                border-radius: 12px;
                color: #eee;
                font-size: 16px;
                cursor: pointer;
                transition: background-color 300ms;

                &:hover {
                    background: #cccccc66;
                }

                &:active {
                    background: #cccccc44;
                }
            }

            .start-button {
                flex: 1;
            }

            .config-button {
                margin-left: unset;
                padding: 12px;
                font-size: 20px;

                span {
                    transform: rotate(0deg);
                    transition: transform 200ms;
                }

                &:hover>span {
                    transform: rotate(90deg);
                }
            }
        }

        .config-div {
            position: absolute;
            top: 40%;
            left: 0;
            right: 0;
            // right: 24px;
            // background: #eeeeeeee;
            // opacity: 0;
            // width: 44px;
            // height: 40px;
            // border-radius: 12px;
            // z-index: 0;
            transform: translateY(320px);
            transition: transform 300ms, top 300ms;
            // pointer-events: none;
            // transition: opacity 300ms, right 300ms, width 300ms, height 300ms;
            // overflow: hidden;

            .config-title {
                i {
                    padding: 10px 12px;
                    font-size: 20px;
                    transform: rotate(0deg);
                    transition: color 300ms, transform 200ms;
                    cursor: pointer;
                    color: #333333ee;
                    border-radius: 100px;
                    overflow: hidden;

                    &:hover {
                        color: #333333cc;
                        transform: rotate(-90deg);
                    }

                    &:active {
                        color: #33333399;
                    }
                }
            }

            .config-body {
                padding: 24px;

                .config-form {
                    display: flex;
                    align-items: center;
                    padding: 16px 0;

                    &:not(:last-child) {
                        // border-bottom: 1px dotted #ccc;
                        border-bottom: 1px dashed #ccc;
                    }

                    >label {
                        // color: #333;
                        min-width: 120px;
                        color: #ccc;
                        text-shadow: 0 0 3px #333;
                        user-select: none;
                    }

                    .config-input {
                        // margin-top: 8px;
                        // margin-bottom: 12px;
                        flex: 1;
                        text-align: center;
                        display: flex;
                        align-items: center;
                        // gap: 24px;

                        &.memorized-config {
                            justify-content: flex-start;
                            gap: 20px;
                            .el-button {
                                background-color: #409effcc;
                            }
                        }

                        .el-input-number {

                            .el-input-number__decrease,
                            .el-input-number__increase {
                                background: rgba(238, 238, 238, 0.4);
                                backdrop-filter: blur(12px);
                                border-width: 0;
                                color: #eee;
                                font-size: 16px;

                                &.is-disabled {

                                    &:hover,
                                    &:active {
                                        background: rgba(238, 238, 238, 0.4);
                                    }
                                }

                                &:hover {
                                    background: #cccccc66;
                                }

                                &:active {
                                    background: #cccccc44;
                                }
                            }

                            .el-input__wrapper {
                                box-shadow: 0 0 2px #333;
                                background: rgba(238, 238, 238, 0.4);
                                backdrop-filter: blur(12px);
                                border-width: 0;
                                color: #eee;
                                font-size: 16px;

                                input {
                                    color: #eee;
                                }
                            }
                        }

                        .el-radio-group {
                            flex-wrap: nowrap;

                            .el-radio-button__inner {
                                background: #ffffff99;
                            }

                            :not(.is-disabled) {
                                .el-radio-button__inner {
                                    &:hover {
                                        color: unset;
                                        background: #ffffff77;
                                    }

                                    &:active {
                                        background: #cccccc66;
                                    }
                                }
                            }

                            .is-active .el-radio-button__inner {
                                &:hover {
                                    color: #fff;
                                    background: #409effcc;
                                }

                                background: #409eff99;
                            }
                        }

                        .el-select {
                            width: 50%;
                        }

                        .dictionary-upload {
                            flex: 1;

                            .el-button {
                                background-color: #409effcc;
                            }
                        }
                    }

                    .text-tips {
                        padding-left: 24px;
                        color: #ccc;
                        text-shadow: 0 0 3px #333;
                        user-select: none;
                        font-size: 14px;
                    }
                }
            }
        }
    }
}

.word-container {
    width: 64vw;
    // height: 85vh;
    height: 80vh;
    backdrop-filter: blur(48px);
    border-radius: 30px;
    background-color: #00000044;
    // display: flex;
    // align-items: center;
    // justify-content: center;
    outline: none;
    user-select: none;
    animation: dictation-ease-in 800ms;
    display: none;

    &.show-container {
        display: block;
    }

    .go-back {
        display: flex;
        position: relative;
        top: 24px;
        left: 24px;
        z-index: 3;
        font-size: 28px;
        color: #ccc;

        .el-icon:hover {
            color: #fff;
            cursor: pointer;
        }
    }

    .total-progress {
        position: absolute;
        bottom: 0px;
        left: 24px;
        right: 24px;

        .progress-tips {
            color: #cecece;
            font-size: 14px;
            text-align: center;
        }
    }

    .result-carousel-item {
        .result-table {
            margin-top: 72px;
            width: 88%;

            .el-table {
                background-color: transparent;
                --el-table-header-bg-color: transparent;
                --el-table-tr-bg-color: transparent;
                --el-table-row-hover-bg-color: #ffffff22;
                --el-table-text-color: white;
                --el-table-header-text-color: #ddd;
                --el-bg-color: transparent;

                .table-status-col,
                .table-word-col {
                    cursor: pointer;
                }
            }
            .table-control-buttons {
                display: flex;
                justify-content: flex-end;
                padding: 12px 0;

                .el-button {
                    box-shadow: 0 0 2px #333;
                    background: #eeeeee66;
                    backdrop-filter: blur(12px);
                    border-width: 0;
                    border-radius: 6px;
                    color: #eee;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background-color 300ms;

                    &:hover {
                        background: #cccccc66;
                    }

                    &:active {
                        background: #cccccc44;
                    }
                }
            }
        }
    }

    @keyframes dictation-ease-in {
        from {
            opacity: 0;
            transform: scale(0.75) translateY(16px);
        }

        to {
            opacity: 1;
            transform: scale(1) translateY(0px);
        }
    }

    .el-carousel__indicators--horizontal {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        width: 760px;
        bottom: 20px;

        // display: grid;
        // // grid-template-columns: repeat(10, 10%);
        // // width: 30%;
        // grid-template-columns: repeat(20, 5%);
        // width: 60%;
        // flex-wrap: wrap;
        // justify-items: center;
        .num-indicator {
            color: white;
            font-size: 10px;
            display: block;
            // width: calc(5% - 4px);
            width: 30px;
            height: 0;
            position: absolute;
            margin-top: -14px;
            // top: 0px;
            text-align: center;
            opacity: .6;
            transition: opacity 300ms;
        }

        .is-active .num-indicator {
            font-weight: bold;
            opacity: 1;
        }
    }

    .dictation-word-num {
        position: absolute;
        top: 10px;
        color: white;
        text-shadow: 0 0 1px #333;
    }

    .dictation-main-body {
        // width: 100vw;
        // height: 100vh;
        height: 100%;
        // padding-bottom: 8%;
        padding-top: 14%;
        padding-bottom: 16%;

        display: flex;
        align-items: center;
        // justify-content: center;
        flex-direction: column;
        // gap: 12px;

        .word-letter {
            font-size: 42px;
            font-weight: bold;
            // color: var(--el-color-primary-light-3);
            // color: var(--el-color-warning-light-3);
            color: var(--el-color-warning);
            // color: white;
            text-shadow: 0 0 2px #111;

            // -webkit-text-stroke: 1px #333;
            &.correct-letter {
                color: var(--el-color-primary);
            }

            &.origin-letter {
                color: var(--el-color-success);
            }

            &.error-letter {
                color: var(--el-color-error);
            }
        }

        .word-wrapper {
            height: 40%;
            display: flex;
            justify-content: center;
            // flex-wrap: wrap;
            padding-bottom: 16px;
            width: 58vw;

            .letter-wrapper {
                margin-top: auto;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
            }

            .word-letter {
                @keyframes letter-float {
                    from {
                        transform: translateY(6px);
                        opacity: 0;
                    }

                    to {
                        transform: translateY(0px);
                        opacity: 1;
                    }
                }

                animation: letter-float 300ms;

                &.input-cursor {
                    animation: cursor 600ms linear infinite alternate;

                    @keyframes cursor {
                        from {
                            opacity: 0;
                        }

                        to {
                            opacity: 1;
                        }
                    }
                }
            }
        }

        .word-answer {
            // position: absolute;
            height: 60%;
        }

        .meaning-container {
            height: 60%;
            width: 50vw;
            display: flex;
            // justify-content: center;
            justify-content: flex-start;
            flex-direction: column;
            align-items: center;

            .meaning-wrapper {
                list-style: none;
                padding-inline-start: 0;
                // width: 24vw;
                // margin: 6px auto;

                .meaning-single {
                    color: #fff;
                    text-shadow: 0 0 10px #333;
                    font-size: 18px;
                    padding-block-start: 6px;
                    padding-block-end: 6px;

                    .part-of-speech {
                        color: #ddd;
                        font-family: 'Times New Roman', Times, serif;
                        display: inline-block;
                        min-width: 3em;
                    }
                }
            }
        }
    }

    .dictation-tips {
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

    .answer-tips {
        padding: 24px;

        .el-button {
            box-shadow: 0 0 2px #333;
            background: #cccccc33;
            backdrop-filter: blur(12px);
            border-width: 0;
            // border-radius: 12px;
            color: #eee;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 300ms, opacity 300ms;

            &:hover {
                background: #eeeeee44;
            }

            &:active {
                background: #cccccc44;
            }
        }
    }
}</style>
