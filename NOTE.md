已知方案：

1. 一个视频、图片对应一个 video 标签元素和 canvas 或是 image
2. 先按特定 fps 抽帧，然后各元素统一渲染到 canvas
3. 直接用元素（video、img）渲染到 html

实现思路：

1. ffmpeg 获取的是视频的每一帧图片

canvas编辑看看能不能用这个组件

https://www.leaferjs.com/ui/guide/