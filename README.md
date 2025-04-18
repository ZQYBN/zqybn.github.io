# 湄洲岛妈祖庙VR全景系统

## 项目简介
本项目是一个基于 A-Frame 的Web VR全景应用，为用户提供湄洲岛妈祖庙的在线虚拟参观体验。通过沉浸式的VR技术，用户可以足不出户，便能身临其境地感受妈祖庙的庄严与文化底蕴。

## 声明
本文档由AI辅助生成
## License  
This project is licensed under the MIT License.  
Includes code from [A-Frame](https://aframe.io), also under the MIT License.
## 主要功能
- **全景浏览**: 提供高清全景图片，支持360度无死角观看
- **VR模式**: 支持手机VR模式，配合VR眼镜使用可获得更好的沉浸感 
- **路径导航**: 设计合理的参观路线，提供清晰的导航指引
- **交互功能**: 基于凝视的交互系统,操作简单直观
- **场景编辑**: 支持编辑和保存场景路径点配置
- **自适应设计**: 支持多种设备访问，包括PC、手机等

## 技术架构
- **前端框架**: 基于 A-Frame 1.7.0 开发
- **交互系统**: 使用 A-Frame 的光标(cursor)组件实现凝视交互
- **数据管理**: 使用 JSON 配置文件存储场景和路径点数据
- **兼容性**: 集成 WebXR Polyfill 确保跨浏览器兼容性

## 项目结构
```
├── img/                # 资源文件
│   ├── sky/           # 场景全景图 
│   └── icon/          # 导航图标
├── js/                # JavaScript源码
│   ├── wayPointLoad.js  # 路径点加载和场景切换
│   └── wayPointEditor.js # 路径点编辑器
├── json/              # 配置文件
│   └── wayPoints.json   # 路径点数据
└── index.html         # 主页面
```

## 使用说明
### 基础操作
- 使用鼠标拖拽或设备陀螺仪控制视角 
- 注视导航点1.5秒切换场景
- 点击右下角按钮进入VR模式

### 编辑器操作
- 空格键: 获取当前视角交点坐标
- C键: 在交点位置创建路径点
- D键: 删除注视的路径点
- S键: 保存注视的路径点,设置目标场景和图标
- E键: 导出路径点配置为JSON文件

## 环境要求
- 支持 WebXR 的现代浏览器(Chrome、Firefox等)
- 移动端支持陀螺仪的 Android/iOS 设备
- VR模式需要WebXR兼容的设备和浏览器

## 部署说明
1. 克隆项目到本地
2. 使用 HTTP 服务器托管项目目录
3. 通过浏览器访问对应地址

## 许可说明
本项目采用 MIT 许可证

