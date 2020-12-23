const Reactive = require('Reactive');
const CameraInfo = require('CameraInfo');
const Units = require('Units');
const Scene = require('Scene');

const mainCamera = Scene.root.findFirst('Camera');
const units = Units.cm(10);

class Scaler {
    constructor(baseWidth, baseHeight) {
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;
    }

    /**
     * @returns {ScalarSignal}
     */
    get baseRatio() {
        return Reactive.div(this.baseHeight, this.baseWidth);
    }

    /**
    * @returns {ScalarSignal}
    */
    get realRatio() {
        return height.div(width);
    }

    /**
     * @returns {ScalarSignal}
     */
    get multiplier() {
        return this.baseRatio.div(this.realRatio);
    }

    /**
     * @returns {ScaleSignal}
     */
    get scaleMultiplier() {
        return Reactive.pack3(1, 1, 1).mul(this.multiplier);
    }

    /**
     * @param {SceneObjectBase} sceneObject 
     */
    autoScaleObject(sceneObject, preferredX = undefined, preferredY = undefined, preferredZ = undefined) {
        const x = preferredX ? preferredX : sceneObject.transform.scaleX.pinLastValue();
        const y = preferredY ? preferredY : sceneObject.transform.scaleY.pinLastValue();
        const z = preferredZ ? preferredZ : sceneObject.transform.scaleZ.pinLastValue();
        sceneObject.transform.scale = this.scaleMultiplier.mul(Reactive.pack3(x, y, z));
    }
}

export function createScaler(baseWidth, baseHeight) {
    return new Scaler(baseWidth, baseHeight);
}

/** @type {ScalarSignal} The width of the screen resolution in ScalarSignal */
export const width = CameraInfo.previewSize.width;

/** @type {ScalarSignal} The height of the screen resolution in ScalarSignal */
export const height = CameraInfo.previewSize.height;

/** @type {ScalarSignal} CameraInfo.previewScreenScale */
export const screenScale = CameraInfo.previewScreenScale;

/**
 * The percentage [0-1] of position X in screen coordinates. `0` is left, `1` is right.
 * @param {ScalarSignal} percent
 * @returns {Promise<ScalarSignal>}
 */
export async function percentToFocalPlaneX(percent) {
    const fullscreen = await getFullscreenSize();
    const widthMax = Reactive.div(width, height).mul(fullscreen.y.mul(0.5 * units));
    return Reactive.mul(percent, widthMax.mul(2)).sub(widthMax);
}

/**
 * The percentage [0-1] of position Y in screen coordinates. `0` is top, `1` is bottom.
 * @param {ScalarSignal} percent
 * @returns {Promise<ScalarSignal>}
 */
export async function percentToFocalPlaneY(percent) {
    const fullscreen = await getFullscreenSize();
    return Reactive.mul(percent, fullscreen.y.mul(-units)).add(fullscreen.y.mul(0.5 * units));
}

/**
 * The percentage [0-1] of position in screen coordinates. `(0, 0)` is left top, `(1, 1)` is right bottom.
 * @param {Point2DSignal} percentLocation
 * @returns {Promise<PointSignal>}
 */
export async function percentToFocalPlane(percentLocation) {
    const [x, y] = await Promise.all([percentToFocalPlaneX(percentLocation.x), percentToFocalPlaneY(percentLocation.y)]);
    return Reactive.pack3(x, y, 0);
}

/**
 * The percentage [0-1] of position X in canvas coordinates. `0` is left, `1` is right.
 * @param {Point2DSignal} percent
 * @returns {PointSignal}
 */
export function percentToCanvasX(percent) {
    return width.div(screenScale).mul(percent);
}

/**
 * The percentage [0-1] of position Y in canvas coordinates. `0` is top, `1` is bottom.
 * @param {Point2DSignal} percent
 * @returns {PointSignal}
 */
export function percentToCanvasY(percent) {
    return height.div(screenScale).mul(percent);
}

/**
 * The percentage [0-1] of position in canvas coordinates. `(0, 0)` is left top, `(1, 1)` is right bottom.
 * @param {Point2DSignal} location
 * @returns {PointSignal}
 */
export function percentToCanvas(location) {
    return Reactive.pack3(percentToCanvasX(location.x), percentToCanvasY(location.y), 0);
}

/**
 * @param {ScalarSignal} positionX 
 * @param {SceneObjectBase=} centerRef 
 */
export function canvasToPercentX(positionX, centerRef) {
    if (centerRef && centerRef.width) {
        return Reactive.add(positionX, centerRef.width.mul(0.5)).div(width).mul(screenScale);
    } else {
        return Reactive.div(positionX, width).mul(screenScale);
    }
}

/**
 * @param {ScalarSignal} positionY 
 * @param {SceneObjectBase=} centerRef 
 */
export function canvasToPercentY(positionY, centerRef) {
    if (centerRef && centerRef.height) {
        return Reactive.add(positionY, centerRef.height.mul(0.5)).div(height).mul(screenScale);
    } else {
        return Reactive.div(positionY, height).mul(screenScale);
    }
}

/**
 * @param {PointSignal} location 
 * @param {SceneObjectBase=} centerRef 
 */
export function canvasToPercent(location, centerRef) {
    return Reactive.pack3(canvasToPercentX(location.x, centerRef), canvasToPercentY(location.y, centerRef), 0);
}

/**
 * @param {ScalarSignal} positionX
 * @returns {Promise<ScalarSignal>}
 */
export async function focalPlaneXToPercent(positionX) {
    const fullscreen = await getFullscreenSize();
    const widthMax = Reactive.div(width, height).mul(fullscreen.y.mul(0.5 * units));
    return Reactive.add(positionX, widthMax).div(widthMax.mul(2));
}

/**
 * @param {ScalarSignal} positionY
 * @returns {Promise<ScalarSignal>}
 */
export async function focalPlaneYToPercent(positionY) {
    const fullscreen = await getFullscreenSize();
    return fullscreen.y.mul(0.5 * units).sub(positionY).div(fullscreen.y.mul(units));
}

/**
* @param {PointSignal} position
* @returns {Promise<Point2DSignal>}
*/
export async function focalPlaneToPercent(position) {
    const [x, y] = await Promise.all([focalPlaneXToPercent(position.x), focalPlaneYToPercent(position.y)]);
    return Reactive.pack2(x, y);
}

/**
 * Convert canvas position to focal plane position.
 * @param {PointSignal} position 
 * @param {SceneObjectBase=} centerRef 
 */
export async function canvasToFocalPlane(position, centerRef) {
    const percent = canvasToPercent(position, centerRef);
    return await percentToFocalPlane(percent);
}

/**
 * @param {PointSignal} position 
 * @param {SceneObjectBase=} centerRef 
 */
export async function focalPlaneToCanvas(position, centerRef) {
    const percent = await focalPlaneToPercent(position);

    if (centerRef && centerRef.width && centerRef.height) {
        return Reactive.pack3(
            percentToCanvasX(percent.x).sub(centerRef.width.mul(0.5)),
            percentToCanvasY(percent.y).sub(centerRef.height.mul(0.5)),
            0
        );
    } else {
        return Reactive.pack3(
            percentToCanvasX(percent.x),
            percentToCanvasY(percent.y),
            0
        );
    }
}

/**
 * The fullscreen size on Focal Plane
 * @returns {Promise<PointSignal>}
 */
export function getFullscreenSize() {
    return mainCamera.then(camera =>
        Reactive.pack3(camera.focalPlane.width.mul(Units.m(10)), camera.focalPlane.height.mul(Units.m(10)), 1)
    );
}

/**
 * The current width of the screen window in pixels
 * @returns {Promise<number>}
 */
export function getWidth() {
    return new Promise(resolve => { width.monitor({ 'fireOnInitialValue': true }).select('newValue').take(1).subscribe(resolve) })
}

/**
 * The current height of the screen window in pixels
 * @returns {Promise<number>}
 */
export function getHeight() {
    return new Promise(resolve => { height.monitor({ 'fireOnInitialValue': true }).select('newValue').take(1).subscribe(resolve) })
}

/**
 * Represents a display resolution
 * @returns {Promise<{width: number, height: number, toString(): string}>}
 */
export async function getResolution() {
    const [w, h] = await Promise.all([getWidth(), getHeight(),]);
    return {
        width: w,
        height: h,
        toString() { return `${w} x ${h}` },
    }
}

/**
 * This only used for getting the same position as faceMesh from tracker's cameraTransform.
 * @param {PointSignal} cameraTransformPosition 
 * @returns {Promise<PointSignal>}
 */
export function cameraTransformToFocalDistance(cameraTransformPosition) {
    return mainCamera.then(camera => cameraTransformPosition.add(Reactive.pack3(0, 0, camera.focalPlane.distance)));
}

/**
 * This only used for getting screen position of tracker's cameraTransform.
 * @param {PointSignal} cameraTransformPosition 
 * @returns {Promise<PointSignal>}
 */
export async function cameraTransformToFocalPlane(cameraTransformPosition) {
    const percent = await worldToPixel01(cameraTransformPosition);
    const [x, y] = await Promise.all([percentToFocalPlaneX(percent.x), percentToFocalPlaneY(percent.y)]);
    return Reactive.pack3(x, y.neg(), 0);
}

/**
 * @param {PointSignal} cameraTransformPosition 
 * @returns {Promise<Point2DSignal>}
 */
export async function cameraTransformToPercent(cameraTransformPosition) {
    const focalPlane = await cameraTransformToFocalPlane(cameraTransformPosition);
    return await focalPlaneToPercent(focalPlane);
}

/**
 * Convert position of tracker's cameraTransform to world.
 * @param {PointSignal} cameraTransformPosition 
 * @param {SceneObjectBase=} centerRef Reference object's width and height to offset. 
 * @returns {Promise<PointSignal>}
 */
export async function cameraTransformToCanvas(cameraTransformPosition, centerRef) {
    const percent = await worldToPixel01(cameraTransformPosition);

    if (centerRef && centerRef.width && centerRef.height) {
        return Reactive.pack3(
            percentToCanvasX(percent.x).sub(centerRef.width.mul(0.5)),
            percentToCanvasY(percent.y).neg().add(height.div(screenScale)).sub(centerRef.height.mul(0.5)),
            0
        );
    } else {
        return Reactive.pack3(
            percentToCanvasX(percent.x),
            percentToCanvasY(percent.y).neg(),
            0
        );
    }
}

/**
 * Convert position of worldTransform to focal plane position.
 * @param {PointSignal} worldPosition 
 * @returns {Promise<PointSignal>}
 */
export async function worldToFocalPlane(worldPosition) {
    const position = await inverseWorldTransform(worldPosition);
    const percent = await worldToPixel01(position);
    const [x, y] = await Promise.all([percentToFocalPlaneX(percent.x), percentToFocalPlaneY(percent.y)]);
    return Reactive.pack3(x, y.neg(), 0);
}

/**
 * Convert position of worldTransform to canvas position.
 * @param {PointSignal} worldPosition 
 * @param {SceneObjectBase=} centerRef Reference object's width and height to offset. 
 * @returns {Promise<PointSignal>}
 */
export async function worldToCanvas(worldPosition, centerRef) {
    const position = await inverseWorldTransform(worldPosition);
    const percent = await worldToPixel01(position);

    if (centerRef && centerRef.width && centerRef.height) {
        return Reactive.pack3(
            percentToCanvasX(percent.x).sub(centerRef.width.mul(0.5)),
            percentToCanvasY(percent.y).neg().add(height.div(screenScale)).sub(centerRef.height.mul(0.5)),
            0
        );
    } else {
        return Reactive.pack3(
            percentToCanvasX(percent.x),
            percentToCanvasY(percent.y).neg(),
            0
        );
    }
}

/**
 * Convert position of worldTransform to focal position in [0-1] percent.
 * @param {PointSignal} worldPosition
 * @returns {Promise<Point2DSignal>}
 */
export async function worldToPercet(worldPosition) {
    const position = await worldToFocalPlane(worldPosition);
    return await focalPlaneToPercent(position);
}

/**
 * Convert world position to camera position
 * @param {PointSignal} worldPosition 
 * @returns {Promise<PointSignal>}
 */
function inverseWorldTransform(worldPosition) {
    return mainCamera.then(camera => camera.worldTransform.inverse().applyToPoint(worldPosition));
}

/**
 * Convert position of worldTransform to screen position in 0-1.
 * @param {PointSignal} worldPosition 
 * @returns {Promise<Point2DSignal>}
 */
async function worldToPixel01(worldPosition) {
    const pixel = await worldToPixel(worldPosition);
    const perX = pixel.x.div(width.mul(screenScale));
    const perY = pixel.y.div(height.mul(screenScale));
    return Reactive.point2d(perX, perY);
}

/**
 * Convert position of worldTransform to screen position.
 * @param {PointSignal} worldPosition 
 * @returns {Promise<Point2DSignal>}
 */
function worldToPixel(worldPosition) {
    return mainCamera.then(camera => {
        const widthTan = camera.focalPlane.width.div(2).div(camera.focalPlane.distance);
        const heightTan = camera.focalPlane.height.div(2).div(camera.focalPlane.distance);

        const scaled_width = width.mul(screenScale);
        const scaled_height = height.mul(screenScale);

        const focalPlaneWidthAtObject = worldPosition.z.mul(widthTan).mul(2);
        const focalPlaneHeightAtObject = worldPosition.z.mul(heightTan).mul(2);
        const pixelX = scaled_width.div(focalPlaneWidthAtObject).mul(worldPosition.x).neg().add(scaled_width.div(2));
        const pixelY = scaled_height.div(focalPlaneHeightAtObject).mul(worldPosition.y).neg().add(scaled_height.div(2));
        return Reactive.point2d(pixelX, pixelY);
    })
}