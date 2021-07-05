"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerspectiveScale = exports.worldToPercet = exports.worldToPercent = exports.worldToCanvas = exports.worldToFocalPlane = exports.cameraTransformToWrold = exports.cameraTransformToCanvas = exports.cameraTransformToPercent = exports.cameraTransformToFocalPlane = exports.cameraTransformToFocalDistance = exports.getResolution = exports.getHeight = exports.getWidth = exports.getFullscreenSize = exports.focalPlaneToCanvas = exports.canvasToFocalPlane = exports.focalPlaneToPercent = exports.focalPlaneYToPercent = exports.focalPlaneXToPercent = exports.canvasToPercent = exports.canvasToPercentY = exports.canvasToPercentX = exports.percentToCanvas = exports.percentToCanvasY = exports.percentToCanvasX = exports.percentToFocalPlane = exports.percentToFocalPlaneY = exports.percentToFocalPlaneX = exports.screenScale = exports.height = exports.width = exports.createScaler = void 0;
const Reactive_1 = __importDefault(require("Reactive"));
const CameraInfo_1 = __importDefault(require("CameraInfo"));
const Units_1 = __importDefault(require("Units"));
const Scene_1 = __importDefault(require("Scene"));
const mainCamera = Scene_1.default.root.findFirst('Camera');
const units = Units_1.default.cm(10);
const fieldOfView = mainCamera.then(camera => camera.fieldOfView ? camera.fieldOfView : Reactive_1.default.val(86));
class Scaler {
    constructor(baseWidth, baseHeight) {
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;
    }
    get baseRatio() {
        return Reactive_1.default.div(this.baseHeight, this.baseWidth);
    }
    get realRatio() {
        return exports.height.div(exports.width);
    }
    get multiplier() {
        return this.baseRatio.div(this.realRatio);
    }
    get scaleMultiplier() {
        return Reactive_1.default.pack3(this.multiplier, this.multiplier, this.multiplier);
    }
    autoScaleObject(sceneObject, preferredX, preferredY, preferredZ) {
        const x = preferredX ? preferredX : sceneObject.transform.scaleX.pinLastValue();
        const y = preferredY ? preferredY : sceneObject.transform.scaleY.pinLastValue();
        const z = preferredZ ? preferredZ : sceneObject.transform.scaleZ.pinLastValue();
        sceneObject.transform.scale = this.scaleMultiplier.mul(Reactive_1.default.pack3(x, y, z));
    }
}
function createScaler(baseWidth, baseHeight) {
    return new Scaler(baseWidth, baseHeight);
}
exports.createScaler = createScaler;
/**
 * The width of the screen resolution in ScalarSignal.
 */
exports.width = CameraInfo_1.default.previewSize.width;
/**
 * The height of the screen resolution in ScalarSignal.
 */
exports.height = CameraInfo_1.default.previewSize.height;
/**
 * CameraInfo.previewScreenScale.
 */
exports.screenScale = CameraInfo_1.default.previewScreenScale;
/**
 * The percentage [0-1] of position X in screen coordinates. `0` is left, `1` is right.
 */
async function percentToFocalPlaneX(percent) {
    const fullscreen = await getFullscreenSize();
    const widthMax = Reactive_1.default.div(exports.width, exports.height).mul(fullscreen.y.mul(0.5 * units));
    return Reactive_1.default.mul(percent, widthMax.mul(2)).sub(widthMax);
}
exports.percentToFocalPlaneX = percentToFocalPlaneX;
/**
 * The percentage [0-1] of position Y in screen coordinates. `0` is top, `1` is bottom.
 */
async function percentToFocalPlaneY(percent) {
    const fullscreen = await getFullscreenSize();
    return Reactive_1.default.mul(percent, fullscreen.y.mul(-units)).add(fullscreen.y.mul(0.5 * units));
}
exports.percentToFocalPlaneY = percentToFocalPlaneY;
/**
 * The percentage [0-1] of position in screen coordinates. `(0, 0)` is left top, `(1, 1)` is right bottom.
 */
async function percentToFocalPlane(percentLocation) {
    const [x, y] = await Promise.all([percentToFocalPlaneX(percentLocation.x), percentToFocalPlaneY(percentLocation.y)]);
    return Reactive_1.default.pack3(x, y, 0);
}
exports.percentToFocalPlane = percentToFocalPlane;
/**
 * The percentage [0-1] of position X in canvas coordinates. `0` is left, `1` is right.
 */
function percentToCanvasX(percent) {
    return exports.width.div(exports.screenScale).mul(percent);
}
exports.percentToCanvasX = percentToCanvasX;
/**
 * The percentage [0-1] of position Y in canvas coordinates. `0` is top, `1` is bottom.
 */
function percentToCanvasY(percent) {
    return exports.height.div(exports.screenScale).mul(percent);
}
exports.percentToCanvasY = percentToCanvasY;
/**
 * The percentage [0-1] of position in canvas coordinates. `(0, 0)` is left top, `(1, 1)` is right bottom.
 */
function percentToCanvas(location) {
    return Reactive_1.default.pack3(percentToCanvasX(location.x), percentToCanvasY(location.y), 0);
}
exports.percentToCanvas = percentToCanvas;
function canvasToPercentX(positionX, centerRef) {
    if (centerRef && centerRef.width) {
        return Reactive_1.default.add(positionX, centerRef.width.mul(0.5)).div(exports.width).mul(exports.screenScale);
    }
    else {
        return Reactive_1.default.div(positionX, exports.width).mul(exports.screenScale);
    }
}
exports.canvasToPercentX = canvasToPercentX;
function canvasToPercentY(positionY, centerRef) {
    if (centerRef && centerRef.height) {
        return Reactive_1.default.add(positionY, centerRef.height.mul(0.5)).div(exports.height).mul(exports.screenScale);
    }
    else {
        return Reactive_1.default.div(positionY, exports.height).mul(exports.screenScale);
    }
}
exports.canvasToPercentY = canvasToPercentY;
function canvasToPercent(location, centerRef) {
    return Reactive_1.default.pack2(canvasToPercentX(location.x, centerRef), canvasToPercentY(location.y, centerRef));
}
exports.canvasToPercent = canvasToPercent;
async function focalPlaneXToPercent(positionX) {
    const fullscreen = await getFullscreenSize();
    const widthMax = Reactive_1.default.div(exports.width, exports.height).mul(fullscreen.y.mul(0.5 * units));
    return Reactive_1.default.add(positionX, widthMax).div(widthMax.mul(2));
}
exports.focalPlaneXToPercent = focalPlaneXToPercent;
async function focalPlaneYToPercent(positionY) {
    const fullscreen = await getFullscreenSize();
    return fullscreen.y.mul(0.5 * units).sub(positionY).div(fullscreen.y.mul(units));
}
exports.focalPlaneYToPercent = focalPlaneYToPercent;
async function focalPlaneToPercent(position) {
    const [x, y] = await Promise.all([focalPlaneXToPercent(position.x), focalPlaneYToPercent(position.y)]);
    return Reactive_1.default.pack2(x, y);
}
exports.focalPlaneToPercent = focalPlaneToPercent;
/**
 * Convert canvas position to focal plane position.
 */
async function canvasToFocalPlane(position, centerRef) {
    const percent = canvasToPercent(position, centerRef);
    return await percentToFocalPlane(percent);
}
exports.canvasToFocalPlane = canvasToFocalPlane;
async function focalPlaneToCanvas(position, centerRef) {
    const percent = await focalPlaneToPercent(position);
    if (centerRef && centerRef.width && centerRef.height) {
        return Reactive_1.default.pack3(percentToCanvasX(percent.x).sub(centerRef.width.mul(0.5)), percentToCanvasY(percent.y).sub(centerRef.height.mul(0.5)), 0);
    }
    else {
        return Reactive_1.default.pack3(percentToCanvasX(percent.x), percentToCanvasY(percent.y), 0);
    }
}
exports.focalPlaneToCanvas = focalPlaneToCanvas;
/**
 * The fullscreen size on Focal Plane.
 */
async function getFullscreenSize() {
    const camera = await mainCamera;
    return Reactive_1.default.pack3(camera.focalPlane.width.mul(Units_1.default.m(10)), camera.focalPlane.height.mul(Units_1.default.m(10)), 1);
}
exports.getFullscreenSize = getFullscreenSize;
/**
 * The current width of the screen window in pixels.
 */
function getWidth() {
    return new Promise(resolve => { exports.width.monitor({ 'fireOnInitialValue': true }).select('newValue').take(1).subscribe(resolve); });
}
exports.getWidth = getWidth;
/**
 * The current height of the screen window in pixels.
 */
function getHeight() {
    return new Promise(resolve => { exports.height.monitor({ 'fireOnInitialValue': true }).select('newValue').take(1).subscribe(resolve); });
}
exports.getHeight = getHeight;
/**
 * Represents a display resolution.
 */
async function getResolution() {
    const [w, h] = await Promise.all([getWidth(), getHeight(),]);
    return {
        width: w,
        height: h,
        toString() { return `${w} x ${h}`; },
    };
}
exports.getResolution = getResolution;
/**
 * Get the same position as faceMesh from tracker's cameraTransform.
 */
async function cameraTransformToFocalDistance(cameraTransformPosition) {
    const camera = await mainCamera;
    return cameraTransformPosition.add(Reactive_1.default.pack3(0, 0, camera.focalPlane.distance));
}
exports.cameraTransformToFocalDistance = cameraTransformToFocalDistance;
/**
 * Get screen position of tracker's cameraTransform.
 */
async function cameraTransformToFocalPlane(cameraTransformPosition) {
    const percent = await worldToPixel01(cameraTransformPosition);
    const [x, y] = await Promise.all([percentToFocalPlaneX(percent.x), percentToFocalPlaneY(percent.y)]);
    return Reactive_1.default.pack3(x, y.neg(), 0);
}
exports.cameraTransformToFocalPlane = cameraTransformToFocalPlane;
async function cameraTransformToPercent(cameraTransformPosition) {
    const focalPlane = await cameraTransformToFocalPlane(cameraTransformPosition);
    return await focalPlaneToPercent(focalPlane);
}
exports.cameraTransformToPercent = cameraTransformToPercent;
/**
 * Convert position of tracker's cameraTransform to canvas.
 * @param {SceneObjectBase=} centerRef Reference object's width and height to offset.
 */
async function cameraTransformToCanvas(cameraTransformPosition, centerRef) {
    const percent = await worldToPixel01(cameraTransformPosition);
    if (centerRef && centerRef.width && centerRef.height) {
        return Reactive_1.default.pack3(percentToCanvasX(percent.x).sub(centerRef.width.mul(0.5)), percentToCanvasY(percent.y).neg().add(exports.height.div(exports.screenScale)).sub(centerRef.height.mul(0.5)), 0);
    }
    else {
        return Reactive_1.default.pack3(percentToCanvasX(percent.x), percentToCanvasY(percent.y).neg(), 0);
    }
}
exports.cameraTransformToCanvas = cameraTransformToCanvas;
/**
 * Convert position of tracker's cameraTransform to world.
 */
async function cameraTransformToWrold(cameraTransformPosition) {
    const camera = await mainCamera;
    return camera.worldTransform.applyToPoint(cameraTransformPosition);
}
exports.cameraTransformToWrold = cameraTransformToWrold;
/**
 * Convert position of worldTransform to focal plane position.
 */
async function worldToFocalPlane(worldPosition) {
    const position = await inverseWorldTransform(worldPosition);
    const percent = await worldToPixel01(position);
    const [x, y] = await Promise.all([percentToFocalPlaneX(percent.x), percentToFocalPlaneY(percent.y)]);
    return Reactive_1.default.pack3(x, y.neg(), 0);
}
exports.worldToFocalPlane = worldToFocalPlane;
/**
 * Convert position of worldTransform to canvas position.
 */
async function worldToCanvas(worldPosition, centerRef) {
    const position = await inverseWorldTransform(worldPosition);
    const percent = await worldToPixel01(position);
    if (centerRef && centerRef.width && centerRef.height) {
        return Reactive_1.default.pack3(percentToCanvasX(percent.x).sub(centerRef.width.mul(0.5)), percentToCanvasY(percent.y).neg().add(exports.height.div(exports.screenScale)).sub(centerRef.height.mul(0.5)), 0);
    }
    else {
        return Reactive_1.default.pack3(percentToCanvasX(percent.x), percentToCanvasY(percent.y).neg(), 0);
    }
}
exports.worldToCanvas = worldToCanvas;
/**
 * Convert position of worldTransform to focal position in [0-1] percent.
 */
async function worldToPercent(worldPosition) {
    const position = await worldToFocalPlane(worldPosition);
    return await focalPlaneToPercent(position);
}
exports.worldToPercent = worldToPercent;
/**
 * Convert position of worldTransform to focal position in [0-1] percent.
 * @deprecated It's typo of `worldToPercent`
 */
async function worldToPercet(worldPosition) {
    return worldToPercent(worldPosition);
}
exports.worldToPercet = worldToPercet;
/**
 * Get the scale that make the plane in screen space look the same size as the plane in 3d space.
 */
async function getPerspectiveScale(worldPosition) {
    const [camera, fov] = await Promise.all([mainCamera, fieldOfView,]);
    const distance = camera.worldTransform.position.distance(worldPosition);
    const scale = Reactive_1.default.div(1, distance).div(Reactive_1.default.tan(fov / 2 * 0.0174532925).mul(2));
    return Reactive_1.default.pack3(scale, scale, scale);
}
exports.getPerspectiveScale = getPerspectiveScale;
/**
 * Convert world position to camera position.
 */
async function inverseWorldTransform(worldPosition) {
    const camera = await mainCamera;
    return camera.worldTransform.inverse().applyToPoint(worldPosition);
}
/**
 * Convert position of worldTransform to screen position in 0-1.
 */
async function worldToPixel01(worldPosition) {
    const pixel = await worldToPixel(worldPosition);
    const perX = pixel.x.div(exports.width.mul(exports.screenScale));
    const perY = pixel.y.div(exports.height.mul(exports.screenScale));
    return Reactive_1.default.point2d(perX, perY);
}
/**
 * Convert position of worldTransform to screen position.
 */
async function worldToPixel(worldPosition) {
    const camera = await mainCamera;
    const widthTan = camera.focalPlane.width.div(2).div(camera.focalPlane.distance);
    const heightTan = camera.focalPlane.height.div(2).div(camera.focalPlane.distance);
    const scaled_width = exports.width.mul(exports.screenScale);
    const scaled_height = exports.height.mul(exports.screenScale);
    const focalPlaneWidthAtObject = worldPosition.z.mul(widthTan).mul(2);
    const focalPlaneHeightAtObject = worldPosition.z.mul(heightTan).mul(2);
    const pixelX = scaled_width.div(focalPlaneWidthAtObject).mul(worldPosition.x).neg().add(scaled_width.div(2));
    const pixelY = scaled_height.div(focalPlaneHeightAtObject).mul(worldPosition.y).neg().add(scaled_height.div(2));
    return Reactive_1.default.point2d(pixelX, pixelY);
}
