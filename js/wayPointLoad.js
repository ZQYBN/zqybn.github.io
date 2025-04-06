/**
 * @file wayPointLoad.js
 * @description 加载路径点配置和动态创建
 */

//令scene为a-scene，该scene全局唯一
let scene;
//wayPoints对象用于存储路径点配置
// 该对象的结构为：
// wayPoints = {
//     "targetScene": [
//         {
//             "position": "x y z",
//             "rotation": "x y z",
//             "scale": "x y z",
//             "icon": "iconName",(可选)
//             "target": "targetSceneName"
//         },
//         ...
//     ],
//     ...
// };
let wayPoints = {};
//路径相同的部分使用变量名节约空间
let wayPointsPath = 'json/wayPoints.json';
let iconPath = 'img/icon/';
let skyPath = 'img/sky/';

// 使用绝对路径加载JSON配置
fetch(wayPointsPath)
    .then(response => response.json())
    .then(data => {
        wayPoints = data;
        console.log('路径点配置加载成功');
    })
    .catch(error => {
        console.error('加载路径点失败:', error)
        window.alert('加载路径点失败，请刷新后重试');
    });

// 切换天空图片功能
function changeSky(target) {
    document.querySelector('a-sky').setAttribute("src", target);
    console.log('change sky to', target);
};

// 删除路径点功能
function deleteWayPoints() {
    scene.querySelectorAll('a-image').forEach(item => {
        item.parentNode.removeChild(item);
        console.log('delete all wayPoints !')
    });
};

// 创建路径点功能
function createWayPoints(target) {

    // 检查 wayPoint 对象是否有对应的 target 数据
    if (!wayPoints[target] || !Array.isArray(wayPoints[target])) {
        console.error('无效的路径点数据:', target);
        return;
    }

    let number = wayPoints[target].length;
    let defaultIcon = 'pointer';
    for (let i = 0; i < number; i++) {
        // createElement 用于创建实体，但不会附加到场景中
        let wayPoint = document.createElement('a-image');
        // 设置路径点id，方便对应查看
        wayPoint.setAttribute('id', 'pathPoint' + i);
        // 设置类别为可点击，方便cursor识别
        wayPoint.setAttribute('class', 'clickable');
        // 设置位置方向属性
        // 下面是简化版，json中有什么数值就赋值什么数值，灵活性强
        for (let p in wayPoints[target][i]) {
            if (p !== 'icon') {//跳过icon避免重复赋值
                //claude告诉我，对字符判断的性能消耗远低于DOM操作setAttribute
                wayPoint.setAttribute(p, wayPoints[target][i][p]);
            }
        }
        // 最后单独设置路径点的图标,若没有在 json 中直接指定使用默认图标 pointer，使用括号提高空值运算符<??>的优先级
        // 空值运算符<??>的作用是如果前面的值为<null>或<undefined>，则使用后面的值
        wayPoint.setAttribute('src', iconPath + (wayPoints[target][i].icon ?? defaultIcon) + '.png');
        scene.appendChild(wayPoint);

        // 将路径点添加到场景中之后，设置路径点的朝向
        // 计算相机与路径点之间的向量差
        let vCamera = document.querySelector('a-camera').getAttribute('position');
        // console.log('vCamera:', vCamera);
        let wayPointPos = wayPoints[target][i].position.split(' ').map(Number);
        let vWayPoint = new THREE.Vector3(wayPointPos[0], wayPointPos[1], wayPointPos[2]);
        // console.log('vWayPoint:', vWayPoint);
        let subVectors = new THREE.Vector3().subVectors(vCamera, vWayPoint);
        // console.log('subVectors:', subVectors);
        wayPoint.object3D.lookAt(subVectors);
        console.log('lookAt:', subVectors);

        console.log("create wayPoint id:" + i);
    }
};

// 注册一个string组件，用于保存目标路径并实现切换
// 切换到目标场景后删除所有路径点并重新创建
AFRAME.registerComponent('target', {
    schema: { type: 'string' },
    init() {
        scene = document.querySelector('a-scene');
        this.el.addEventListener('click', () => {
            changeSky(skyPath + this.data + '.jpg');
            deleteWayPoints();
            createWayPoints(this.data);
        }
        )
    }
});

