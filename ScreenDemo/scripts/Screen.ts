import Reactive from 'Reactive';
import CameraInfo from 'CameraInfo';
import Units from 'Units';
import Scene from 'Scene';

const mainCamera = Scene.root.findFirst('Camera') as unknown as Promise<Camera>;
const units = Units.cm(10);
const fieldOfView = mainCamera.then(camera =>
    camera.fieldOfView ? camera.fieldOfView : Reactive.val(86)
);

class Scaler {
    readonly baseWidth: number;
    readonly baseHeight: number;

    constructor(baseWidth: number, baseHeight: number) {
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;
    }

    get baseRatio(): ScalarSignal {
        return Reactive.div(this.baseHeight, this.baseWidth);
    }

    get realRatio(): ScalarSignal {
        return height.div(width);
    }

    get multiplier(): ScalarSignal {
        return this.baseRatio.div(this.realRatio);
    }

    get scaleMultiplier(): PointSignal {
        return Reactive.pack3(this.multiplier, this.multiplier, this.multiplier);
    }

    autoScaleObject(sceneObject: SceneObjectBase, preferredX?: number, preferredY?: number, preferredZ?: number) {
        const x = preferredX ? preferredX : sceneObject.transform.scaleX.pinLastValue();
        const y = preferredY ? preferredY : sceneObject.transform.scaleY.pinLastValue();
        const z = preferredZ ? preferredZ : sceneObject.transform.scaleZ.pinLastValue();
        sceneObject.transform.scale = this.scaleMultiplier.mul(Reactive.pack3(x, y, z));
    }
}

export function createScaler(baseWidth:number, baseHeight:number) {
    return new Scaler(baseWidth, baseHeight);
}

/** 
 * The width of the screen resolution in ScalarSignal.
 */
export const width: ScalarSignal = CameraInfo.previewSize.width;

/** 
 * The height of the screen resolution in ScalarSignal.
 */
export const height: ScalarSignal = CameraInfo.previewSize.height;

/** 
 * CameraInfo.previewScreenScale.
 */
export const screenScale: ScalarSignal = CameraInfo.previewScreenScale;

/**
 * The percentage [0-1] of position X in screen coordinates. `0` is left, `1` is right.
 */
export async function percentToFocalPlaneX(percent: ScalarSignal | number): Promise<ScalarSignal> {
    const fullscreen = await getFullscreenSize();
    const widthMax = Reactive.div(width, height).mul(fullscreen.y.mul(0.5 * units));
    return Reactive.mul(percent, widthMax.mul(2)).sub(widthMax);
}

/**
 * The percentage [0-1] of position Y in screen coordinates. `0` is top, `1` is bottom.
 */
export async function percentToFocalPlaneY(percent: ScalarSignal | number): Promise<ScalarSignal> {
    const fullscreen = await getFullscreenSize();
    return Reactive.mul(percent, fullscreen.y.mul(-units)).add(fullscreen.y.mul(0.5 * units));
}

/**
 * The percentage [0-1] of position in screen coordinates. `(0, 0)` is left top, `(1, 1)` is right bottom.
 */
export async function percentToFocalPlane(percentLocation: Point2DSignal): Promise<PointSignal> {
    const [x, y] = await Promise.all([percentToFocalPlaneX(percentLocation.x), percentToFocalPlaneY(percentLocation.y)]);
    return Reactive.pack3(x, y, 0);
}

/**
 * The percentage [0-1] of position X in canvas coordinates. `0` is left, `1` is right.
 */
export function percentToCanvasX(percent: ScalarSignal | number): ScalarSignal {
    return width.div(screenScale).mul(percent);
}

/**
 * The percentage [0-1] of position Y in canvas coordinates. `0` is top, `1` is bottom.
 */
export function percentToCanvasY(percent: ScalarSignal | number): ScalarSignal {
    return height.div(screenScale).mul(percent);
}

/**
 * The percentage [0-1] of position in canvas coordinates. `(0, 0)` is left top, `(1, 1)` is right bottom.
 */
export function percentToCanvas(location: Point2DSignal): PointSignal {
    return Reactive.pack3(percentToCanvasX(location.x), percentToCanvasY(location.y), 0);
}

export function canvasToPercentX(positionX: ScalarSignal | number, centerRef?: PlanarObject) {
    if (centerRef && centerRef.width) {
        return Reactive.add(positionX, centerRef.width.mul(0.5)).div(width).mul(screenScale);
    } else {
        return Reactive.div(positionX, width).mul(screenScale);
    }
}

export function canvasToPercentY(positionY: ScalarSignal | number, centerRef?: PlanarObject) {
    if (centerRef && centerRef.height) {
        return Reactive.add(positionY, centerRef.height.mul(0.5)).div(height).mul(screenScale);
    } else {
        return Reactive.div(positionY, height).mul(screenScale);
    }
}

export function canvasToPercent(location: PointSignal, centerRef?: PlanarObject) {
    return Reactive.pack2(canvasToPercentX(location.x, centerRef), canvasToPercentY(location.y, centerRef));
}

export async function focalPlaneXToPercent(positionX: ScalarSignal | number): Promise<ScalarSignal> {
    const fullscreen = await getFullscreenSize();
    const widthMax = Reactive.div(width, height).mul(fullscreen.y.mul(0.5 * units));
    return Reactive.add(positionX, widthMax).div(widthMax.mul(2));
}

export async function focalPlaneYToPercent(positionY: ScalarSignal | number): Promise<ScalarSignal> {
    const fullscreen = await getFullscreenSize();
    return fullscreen.y.mul(0.5 * units).sub(positionY).div(fullscreen.y.mul(units));
}

export async function focalPlaneToPercent(position: PointSignal): Promise<Point2DSignal> {
    const [x, y] = await Promise.all([focalPlaneXToPercent(position.x), focalPlaneYToPercent(position.y)]);
    return Reactive.pack2(x, y);
}

/** 
 * Convert canvas position to focal plane position.
 */
export async function canvasToFocalPlane(position: PointSignal, centerRef?: PlanarObject) {
    const percent = canvasToPercent(position, centerRef);
    return await percentToFocalPlane(percent);
}

export async function focalPlaneToCanvas(position: PointSignal, centerRef?: PlanarObject) {
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
 * The fullscreen size on Focal Plane. 
 */
export async function getFullscreenSize(): Promise<PointSignal> {
    const camera = await mainCamera;
    return Reactive.pack3(camera.focalPlane.width.mul(Units.m(10)), camera.focalPlane.height.mul(Units.m(10)), 1);
}

/** 
 * The current width of the screen window in pixels. 
 */
export function getWidth(): Promise<number> {
    return new Promise(resolve => { width.monitor({ 'fireOnInitialValue': true }).select('newValue').take(1).subscribe(resolve) })
}

/** 
 * The current height of the screen window in pixels. 
 */
export function getHeight(): Promise<number> {
    return new Promise(resolve => { height.monitor({ 'fireOnInitialValue': true }).select('newValue').take(1).subscribe(resolve) })
}

/** 
 * Represents a display resolution. 
 */
export async function getResolution(): Promise<{ width: number; height: number; toString(): string; }> {
    const [w, h] = await Promise.all([getWidth(), getHeight(),]);
    return {
        width: w,
        height: h,
        toString() { return `${w} x ${h}` },
    }
}

/** 
 * Get the same position as faceMesh from tracker's cameraTransform. 
 */
export async function cameraTransformToFocalDistance(cameraTransformPosition: PointSignal): Promise<PointSignal> {
    const camera = await mainCamera;
    return cameraTransformPosition.add(Reactive.pack3(0, 0, camera.focalPlane.distance));
}

/** 
 * Get screen position of tracker's cameraTransform. 
 */
export async function cameraTransformToFocalPlane(cameraTransformPosition: PointSignal): Promise<PointSignal> {
    const percent = await worldToPixel01(cameraTransformPosition);
    const [x, y] = await Promise.all([percentToFocalPlaneX(percent.x), percentToFocalPlaneY(percent.y)]);
    return Reactive.pack3(x, y.neg(), 0);
}

export async function cameraTransformToPercent(cameraTransformPosition: PointSignal): Promise<Point2DSignal> {
    const focalPlane = await cameraTransformToFocalPlane(cameraTransformPosition);
    return await focalPlaneToPercent(focalPlane);
}

/**
 * Convert position of tracker's cameraTransform to canvas.
 * @param {SceneObjectBase=} centerRef Reference object's width and height to offset. 
 */
export async function cameraTransformToCanvas(cameraTransformPosition: PointSignal, centerRef?: PlanarObject): Promise<PointSignal> {
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
 * Convert position of tracker's cameraTransform to world.
 */
export async function cameraTransformToWrold(cameraTransformPosition: PointSignal): Promise<PointSignal> {
    const camera = await mainCamera;
    return camera.worldTransform.applyToPoint(cameraTransformPosition);
}

/** 
 * Convert position of worldTransform to focal plane position.
 */
export async function worldToFocalPlane(worldPosition: PointSignal): Promise<PointSignal> {
    const position = await inverseWorldTransform(worldPosition);
    const percent = await worldToPixel01(position);
    const [x, y] = await Promise.all([percentToFocalPlaneX(percent.x), percentToFocalPlaneY(percent.y)]);
    return Reactive.pack3(x, y.neg(), 0);
}

/**
 * Convert position of worldTransform to canvas position.
 */
export async function worldToCanvas(worldPosition: PointSignal, centerRef?: PlanarObject): Promise<PointSignal> {
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
 */
export async function worldToPercent(worldPosition: PointSignal): Promise<Point2DSignal> {
    const position = await worldToFocalPlane(worldPosition);
    return await focalPlaneToPercent(position);
}

/**
 * Convert position of worldTransform to focal position in [0-1] percent.
 * @deprecated It's typo of `worldToPercent`
 */
export async function worldToPercet(worldPosition: PointSignal): Promise<Point2DSignal> {
    return worldToPercent(worldPosition);
}

/**
 * Get the scale that make the plane in screen space look the same size as the plane in 3d space.
 */
export async function getPerspectiveScale(worldPosition: PointSignal): Promise<PointSignal> {
    const [camera, fov] = await Promise.all([mainCamera, fieldOfView,]);
    const distance = camera.worldTransform.position.distance(worldPosition);
    const scale = Reactive.div(1, distance).div(Reactive.tan(fov / 2 * 0.0174532925).mul(2));
    return Reactive.pack3(scale, scale, scale);
}

/**
 * Convert world position to camera position.
 */
async function inverseWorldTransform(worldPosition: PointSignal): Promise<PointSignal> {
    const camera = await mainCamera;
    return camera.worldTransform.inverse().applyToPoint(worldPosition);
}

/**
 * Convert position of worldTransform to screen position in 0-1.
 */
async function worldToPixel01(worldPosition: PointSignal): Promise<Point2DSignal> {
    const pixel = await worldToPixel(worldPosition);
    const perX = pixel.x.div(width.mul(screenScale));
    const perY = pixel.y.div(height.mul(screenScale));
    return Reactive.point2d(perX, perY);
}

/**
 * Convert position of worldTransform to screen position.
 */
async function worldToPixel(worldPosition: PointSignal): Promise<Point2DSignal> {
    const camera = await mainCamera;
    const widthTan = camera.focalPlane.width.div(2).div(camera.focalPlane.distance);
    const heightTan = camera.focalPlane.height.div(2).div(camera.focalPlane.distance);
    const scaled_width = width.mul(screenScale);
    const scaled_height = height.mul(screenScale);
    const focalPlaneWidthAtObject = worldPosition.z.mul(widthTan).mul(2);
    const focalPlaneHeightAtObject = worldPosition.z.mul(heightTan).mul(2);
    const pixelX = scaled_width.div(focalPlaneWidthAtObject).mul(worldPosition.x).neg().add(scaled_width.div(2));
    const pixelY = scaled_height.div(focalPlaneHeightAtObject).mul(worldPosition.y).neg().add(scaled_height.div(2));
    return Reactive.point2d(pixelX, pixelY);
}