let mainsky;
let camera;
let wpraycaster;
let skyraycaster;
let saveArray = {};
let tempSaveArray = [];

AFRAME.registerComponent('get-intersection', {
    schema: {},
    init: function () {
        // 等待场景加载完成后初始化组件
        this.el.sceneEl.addEventListener('loaded', () => {
            // 初始化相机引用
            camera = document.querySelector('#maincamera');
            if (!camera) {
                console.warn('未找到相机元素');
                return;
            }

            // 使用 MutationObserver 确保元素加载完成
            const observer = new MutationObserver((mutations) => {
                mainsky = document.querySelector('#mainsky');
                if (mainsky) {
                    // 初始化射线检测器
                    skyraycaster = camera.querySelector('#skyraycaster').components.raycaster;
                    wpraycaster = camera.querySelector('#wpraycaster').components.raycaster;
                    // 添加键盘监听
                    document.body.addEventListener('keydown', this.handleKeyDown);
                    observer.disconnect();
                    console.log('编辑器组件初始化完成');
                }
            });

            observer.observe(this.el.sceneEl, {
                childList: true,
                subtree: true
            });
        });
    },
    // 键盘监听事件
    handleKeyDown: function (event) {
        console.log('检测到按键:', event.key);
        switch (event.key) {
            case ' ': // 空格键执行获取交点坐标
                getPosition();
                break;
            case 'c': // C键执行创建路径点
                const pos = getPosition();
                if (pos) {
                    createTempWayPoint(pos);
                }
                break;
            case 'd': // D键执行删除路径点
                deleteWayPoint();
                break;
            case 's': // S键执行保存路径点
                saveWayPoint();
                break;
            case 'e': // E键执行导出路径点配置为JSON文件
                exportSavedWayPointAsJson();
                break;
        }
    }
});
// 获取交点坐标的方法 
function getPosition() {
    if (!skyraycaster) {
        console.warn('射线检测器组件未初始化');
        return null;
    }
    skyraycaster.refreshObjects();
    const intersections = skyraycaster.intersections;

    if (intersections && intersections.length > 0) {
        const intersection = intersections[0].point;
        console.log('交点坐标：', intersection);
        return intersection;
    } else {
        console.log('未检测到交点');
        return null;
    }
};
// 创建临时路径点图标
function createTempWayPoint(position) {
    if (!position) {
        console.warn('无效的位置信息');
        return;
    }
    // 建议路径点距离相机的半径统一为10米，方便统一视觉大小
    const halfPosition = {
        x: (position.x + camera.getAttribute('position').x) / 2,
        y: (position.y + camera.getAttribute('position').y) / 2,
        z: (position.z + camera.getAttribute('position').z) / 2
    };
    const wayPoint = document.createElement('a-image');
    wayPoint.setAttribute('src', 'img/icon/pointer.png');
    wayPoint.setAttribute('position', halfPosition);
    wayPoint.setAttribute('class', 'clickable');
    wayPoint.setAttribute('scale', '1.2 1.2 1.2');

    document.querySelector('a-scene').appendChild(wayPoint);

    let vCamera = camera.getAttribute('position');
    let vWayPoint = position;
    let subVectors = new THREE.Vector3().subVectors(vCamera, vWayPoint);
    wayPoint.object3D.lookAt(subVectors);

    console.log('临时路径点创建成功:', wayPoint);
};
// 删除路径点图标
function deleteWayPoint() {
    if (!wpraycaster) {
        console.warn('路径点射线检测器未初始化');
        return;
    }
    // 更新射线检测
    wpraycaster.refreshObjects();
    const intersections = wpraycaster.intersections;
    // 检查是否有交点
    // 需要使用if-else防止无结果报错
    if (intersections && intersections.length > 0) {
        const intersectedEl = intersections[0].object.el;
        if (intersectedEl) {
            // 从临时数组中移除
            const index = tempSaveArray.indexOf(intersectedEl);
            if (index > -1) {
                tempSaveArray.splice(index, 1);
            }
            // 从场景中移除
            intersectedEl.parentNode.removeChild(intersectedEl);
            console.log('已删除路径点:', intersectedEl);
        }
    } else {
        console.log('未检测到可删除的路径点');
    }
};
// 保存路径点图标
function saveWayPoint() {
    if (!wpraycaster) {
        console.warn('路径点射线检测器未初始化');
        return;
    }
    // 更新射线检测
    wpraycaster.refreshObjects();
    const intersections = wpraycaster.intersections;
    // 检查是否有交点
    if (intersections && intersections.length > 0) {
        const intersectedEl = intersections[0].object.el;
        // 如果有交点
        if (intersectedEl) {
            // 初始化对话框
            const camera = document.querySelector('#maincamera');
            const dialog = document.getElementById('saveDialog');
            const targetInput = document.getElementById('targetInput');
            const iconInput = document.getElementById('iconInput');
            // 禁用相机控制
            camera.setAttribute('look-controls', 'enabled', false);
            dialog.showModal();
            // 清空之前的输入
            setTimeout(() => {
                targetInput.value = '';
                iconInput.value = '';
            }, 0);
            // 监听对话框关闭事件
            dialog.addEventListener('close', () => {
                if (dialog.returnValue === 'save') {
                    // 检查是否已经保存过
                    if (tempSaveArray.includes(intersectedEl)) {
                        console.log('该路径点已保存');
                        return;
                    }
                    // 表单处理
                    const target = targetInput.value.trim();
                    const icon = iconInput.value.trim() || 'pointer'; // 如果图标为空则使用默认值
                    if (!target) {
                        alert('请输入目标场景');
                        return;
                    }

                    intersectedEl.setAttribute('src', `img/icon/${icon}.png`);
                    intersectedEl.setAttribute('target', target);
                    intersectedEl.setAttribute('icon', icon);

                    tempSaveArray.push(intersectedEl);
                    console.log('已保存路径点:', intersectedEl);
                    console.log('tempSaveArray:', tempSaveArray);

                    // 启用相机控制
                    camera.setAttribute('look-controls', 'enabled', true);
                    saveTempToSave();
                } else {
                    // 取消保存，启用相机控制
                    camera.setAttribute('look-controls', 'enabled', true);
                }
            }, { once: true });
        }
    } else {
        console.log('未检测到可保存的路径点');
    }
};
// 导出路径点配置为JSON文件
// 调用函数导出为json并提供下载
function exportSavedWayPointAsJson() {
    // 缩进4格美化json
    const jsonStr = JSON.stringify(saveArray, null, 4);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waypoints.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('已导出路径点配置:', saveArray);
};
// json处理
function saveTempToSave() {
    const sky = mainsky.getAttribute('src').split('/').pop().replace('.jpg', '');
    const newWayPoint = tempSaveArray.map(wayPoint => {
        // 获取三维坐标对象
        const pos = wayPoint.getAttribute('position');
        console.log('pos:', wayPoint.getAttribute('position')); // 打印pos对象
        return {
            position: `${pos.x} ${pos.y} ${pos.z}`, // 转换为字符串格式
            target: wayPoint.getAttribute('target'),
            icon: wayPoint.getAttribute('icon') || 'pointer'
        };
    });
    if (!saveArray[sky]) {
        saveArray[sky] = [];
    }
    saveArray[sky] = saveArray[sky].concat(newWayPoint);
    tempSaveArray = [];
    console.log('场景路径点已保存:', sky, saveArray[sky]);
}