# 单词助记辅助系统

> 本项目，灵感来自“不背单词”、“有道词典”等网站。

此项目技术上由Vue 3和Vite构建，采用Element Plus组件库。\
用于记忆和检索单词的一个轻量级网站。

## 预览

目前有个预览页面，但可能不是最新版。\
[网页预览](https://spidey120703.github.io/projects/words-project)

## 介绍

本项目目前暂无后台，纯前端的一个轻量级网页。\
本人第一次接触Vue 3和Vite，以及Element Plus组件库，受限于本人的技术水平，内部的代码可能会很乱，许多效果是通过原生JavaScript实现的。\
顺带一提，本项目没有多少注释，本人没有注释的习惯，以后会改的。

## 构建

<b>提示：</b>构建完成后请复制`./src/assets/background`和`./src/assets/data`两个文件至`./dist/assets`下。
```bat
mkdir ".\dist\assets\data" ".\dist\assets\background"
copy ".\src\assets\data\*" ".\dist\assets\data\"
copy ".\src\assets\background\*" ".\dist\assets\background\"
```
