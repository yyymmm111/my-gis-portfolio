# 我的GIS作品集 - 功能说明文档

## 项目概述

本项目是一个综合运用 Leaflet 和 MapLibre GL JS 的个人GIS作品集，用于展示学习地理信息科学过程中的成长轨迹与生活足迹。

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5.4
- **地图引擎**: 
  - Leaflet 1.9.4
  - MapLibre GL JS 4.7
- **数据处理**: Supercluster (点聚合)
- **数据格式**: GeoJSON

## 功能特性

### 1. 地图引擎切换

支持在 Leaflet 和 MapLibre 两个地图引擎之间自由切换，便于对比不同引擎的特点。

**Leaflet 特点**:
- 轻量级，学习曲线平缓
- 丰富的插件生态
- 适合简单到中等复杂度的地图应用

**MapLibre GL JS 特点**:
- 基于矢量瓦片，性能更好
- 支持更复杂的样式配置
- 开源且活跃的社区

### 2. 个人数据管理

数据存储在 `src/data/myPlaces.json` 中，包含15个精选地点：

| 分类 | 数量 | 图标 | 颜色 |
|------|------|------|------|
| 教育 | 2 | 🎓 | 蓝色 |
| 旅行 | 7 | ✈️ | 绿色 |
| 美食 | 1 | 🍜 | 橙色 |
| 文化 | 2 | 🏛️ | 棕黄色 |
| 生活 | 1 | 🏠 | 紫色 |
| 梦想 | 1 | 🎯 | 青色 |

每个地点包含以下属性：
- `id`: 唯一标识
- `name`: 地点名称
- `category`: 分类标识
- `categoryName`: 分类中文名
- `icon`: emoji图标
- `color`: 标记颜色
- `date`: 关联时间
- `description`: 详细描述
- `highlights`: 亮点标签

### 3. 分类筛选

侧边栏提供分类筛选功能：
- 全部：显示所有地点
- 教育：显示学校、培训机构等教育相关地点
- 旅行：显示旅游、观光等地点
- 美食：显示餐厅、小吃等美食地点
- 文化：显示博物馆、艺术馆等文化地点
- 生活：显示日常生活相关地点
- 梦想：显示未来目标地点

### 4. 地点列表

侧边栏显示筛选后的地点列表：
- 点击列表项可定位到对应地点
- 列表项显示图标、名称和分类
- 左侧边框颜色对应地点标记颜色

### 5. 交互功能

- **点击标记**: 打开信息弹窗，显示详细信息
- **悬停标记**: 自动显示弹窗
- **点击列表项**: 地图飞行动画到对应位置并打开弹窗
- **拖拽地图**: 平移视图
- **滚轮缩放**: 缩放地图

### 6. 图层控制

**显示标注**: 
- 控制地点名称标注的显示/隐藏
- Leaflet: 切换标注图层
- MapLibre: 使用 layout 属性的 visibility

**点聚合**:
- MapLibre 版本支持智能聚合
- 当标记密集时自动聚合
- 点击聚合点可展开
- 使用 Supercluster 算法

### 7. 统计信息

实时统计显示：
- 总地点数量
- 分类数量
- 旅行地点数量
- 教育地点数量

## 文件结构

```
gis-portfolio/
├── index.html              # 入口HTML
├── package.json            # 项目配置
├── vite.config.js          # Vite配置
├── src/
│   ├── main.js             # Vue入口
│   ├── App.vue             # 主应用组件
│   ├── components/
│   │   ├── LeafletMap.vue  # Leaflet地图组件
│   │   └── MapLibreMap.vue # MapLibre地图组件
│   └── data/
│       └── myPlaces.json   # 个人地点数据
└── public/                 # 静态资源目录
```

## GeoJSON数据结构

```json
{
  "type": "FeatureCollection",
  "metadata": {
    "author": "GIS学习者",
    "title": "我的GIS作品集"
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": 1,
        "name": "地点名称",
        "category": "category-id",
        "categoryName": "分类名称",
        "icon": "emoji",
        "color": "#hex-color",
        "date": "2025-01-01",
        "description": "描述文本",
        "highlights": ["亮点1", "亮点2"]
      },
      "geometry": {
        "type": "Point",
        "coordinates": [经度, 纬度]
      }
    }
  ]
}
```

## 运行项目

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 自定义数据

如需添加自己的地点数据，编辑 `src/data/myPlaces.json`：

1. 修改 `metadata` 中的作者信息
2. 在 `features` 数组中添加新地点
3. 确保坐标格式正确：`[经度, 纬度]`
4. 选择合适的分类和颜色

## 部署

构建后的文件在 `dist/` 目录，可以部署到：
- GitHub Pages
- Vercel
- Netlify
- 任意静态服务器

## 扩展建议

1. **添加更多分类**: 可根据需要添加"工作"、"摄影"等分类
2. **集成照片**: 在 properties 中添加照片 URL
3. **时间轴功能**: 按时间顺序浏览地点
4. **路线绘制**: 连接相关地点绘制旅行路线
5. **分享功能**: 生成带特定地点的分享链接

## 注意事项

1. MapLibre 版本默认使用 OSM 底图，如需天地图请申请 Token
2. 聚合功能在 MapLibre 版本中可用
3. 建议使用 Chrome/Firefox 等现代浏览器访问

## 版本历史

- v1.0.0 (2025-01): 初始版本，包含基础功能

---

**作者**: GIS学习者  
**学校**: 北京理工大学  
**专业**: 地理信息科学  
**课程**: GIS工程与开发 P1项目
