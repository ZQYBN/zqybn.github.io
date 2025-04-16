/**
 * @file wayPointLoad.js
 * @description 加载路径点配置和动态创建
 */

//令scene为a-scene，该scene全局唯一

let scene;
let home = 'home';//默认场景为home
//wayPoints对象用于存储路径点配置
// 该对象的结构为：
// wayPoints = {
//     "targetScene": [
//         {
//             "position": "x y z",
//             "icon": "iconName",(可选)
//             "target": "targetSceneName"
//         },
//         ...
//     ],
//     ...
// };
let wayPoints = {};
//路径相同的部分使用变量名节约空间
let wayPointsPath = '/reVR/json/wayPoints.json';
let iconPath = '/reVR/img/icon/';
let skyPath = '/reVR/img/sky/';

// 加载JSON配置文件
// 以下到init()由ai生成
async function loadWayPoints() {
    try {
        const response = await fetch(wayPointsPath);
        const data = await response.json();
        wayPoints = data;
        console.log('路径点配置加载成功');
        return true;
    } catch (error) {
        console.error('加载路径点失败:', error);
        window.alert('加载路径点失败，请刷新后重试');
        return false;
    }
}

// 等待场景加载完成
async function waitForScene() {
    return new Promise(resolve => {
        // 如果场景已存在且加载完成
        let sceneEl = document.querySelector('a-scene');
        if (sceneEl && sceneEl.hasLoaded) {
            scene = sceneEl;
            resolve(true);
            return;
        }

        // 如果场景存在但未加载完成
        if (sceneEl) {
            sceneEl.addEventListener('loaded', () => {
                scene = sceneEl;
                resolve(true);
            });
            return;
        }

        // 如果场景不存在，等待 DOM 加载完成
        document.addEventListener('DOMContentLoaded', () => {
            sceneEl = document.querySelector('a-scene');
            if (sceneEl.hasLoaded) {
                scene = sceneEl;
                resolve(true);
            } else {
                sceneEl.addEventListener('loaded', () => {
                    scene = sceneEl;
                    resolve(true);
                });
            }
        });
    });
}

// 初始化函数
async function init() {
    try {
        // 等待场景和数据都加载完成
        const [sceneLoaded, dataLoaded] = await Promise.all([
            waitForScene(),
            loadWayPoints()
        ]);

        if (!sceneLoaded || !dataLoaded) {
            throw new Error('初始化失败：场景或数据加载失败');
        }
        let mainsky = document.createElement('a-sky');
        backToHome(mainsky);
    } catch (error) {
        console.error('初始化失败:', error);
    }
}

function backToHome(mainsky) {
    if (document.querySelector('a-scene').querySelector('#mainsky') == null) {
        mainsky.setAttribute('src', skyPath + home + '.jpg');
        mainsky.setAttribute('id', 'mainsky');
        scene.appendChild(mainsky);
        console.log('场景初始化完成');
    }
    else {
        changeSky(skyPath + 'home' + '.jpg');
    }
    createWayPoints(home);

    // 未完成算法代码
    // 半径设为10米
    // const radius = 10;
    // const centerPoint = document.querySelector('#maincamera').getAttribute('position');
    // console.log('centerPoint:', centerPoint);
    // // 路径点个数
    // const num = wayPoints['home'].length;
    // // 层数
    // const layers = 3;
    // // 每一层的路径点个数
    // const numPerLayer = num / layers;
    // // 角度步长，单位为弧度，前半段是角度，后半段为路径点个数
    // const xAngleStep = (1 / 3 * Math.PI) / (num / layers - 1);
    // // 上下偏移量，单位为弧度，数值自定义
    // const yOffset = (1 / 3 * Math.PI) / (num / layers - 1);
    // // 存储临时路径点
    // const tempWayPoints = [];
    // // 遍历每一层
    // for (let layer = -1; layer < layers; layer++) {
    //     const layerY = centerPoint.y - radius * Math.sin(layer * yOffset);
    //     for (let i = -(numPerLayer / 2); i < numPerLayer / 2; i++) {
    //         const waypoint = {
    //             x: centerPoint.x + radius * Math.cos(i * xAngleStep),
    //             y: layerY,
    //             z: centerPoint.z + radius * Math.sin(i * xAngleStep)
    //         }
    //         tempWayPoints.push(waypoint);
    //     }
    // }
    // if(wayPoints['home'].length == tempWayPoints.length){
    //     for (let i = 0; i < wayPoints['home'].length; i++) {
    //         wayPoints['home'][i].position = tempWayPoints[i].x + ' ' + tempWayPoints[i].y + ' ' + tempWayPoints[i].z;
    //     }
    // }

}
// 启动初始化
init();

// 切换天空图片功能
function changeSky(target) {
    document.querySelector('#mainsky').setAttribute("src", target);
    console.log('change sky to', target);
};

// 删除路径点功能
function deleteWayPoints() {
    scene.querySelectorAll('a-image:not(.permanent)').forEach(item => {
        item.parentNode.removeChild(item);
        // console.log('delete all wayPoints !')
    });
};

// 创建路径点功能
function createWayPoints(target) {

    // 检查 wayPoint 对象是否有对应的 target 数据
    if (!wayPoints[target] || !Array.isArray(wayPoints[target])) {
        console.warn('不在现有路径点数据中:', target);
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
        // 这里只能用split(' ')来分割字符串，map(Number)将字符串转换为数字
        // 用getAttribute('position')获取到的值，向量是空的不能直接拿来用
        let wayPointPos = wayPoints[target][i].position.split(' ').map(Number);
        // console.log('wayPointPos:', wayPointPos); 输出数组[x y z]
        // console.log('get:', wayPoint.getAttribute('position')); 输出对象{x: 0, y: 0, z: 0}
        let vWayPoint = new THREE.Vector3(wayPointPos[0], wayPointPos[1], wayPointPos[2]);
        // console.log('vWayPoint:', vWayPoint);
        let subVectors = new THREE.Vector3().subVectors(vCamera, vWayPoint);
        // console.log('subVectors:', subVectors);
        wayPoint.object3D.lookAt(subVectors);

        // console.log("create wayPoint id:" + i);
        // console.log('lookAt:', subVectors);
    }
};

// 注册一个string组件，用于保存目标路径并实现切换
// 切换到目标场景后删除所有路径点并重新创建
AFRAME.registerComponent('target', {
    schema: { type: 'string' },
    init() {
        this.el.addEventListener('click', () => {
            changeSky(skyPath + this.data + '.jpg');
            deleteWayPoints();
            createWayPoints(this.data);
        }
        )
    }
});

