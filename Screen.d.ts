declare class Scaler {
    readonly baseWidth: number;
    readonly baseHeight: number;
    constructor(baseWidth: number, baseHeight: number);
    get baseRatio(): ScalarSignal;
    get realRatio(): ScalarSignal;
    get multiplier(): ScalarSignal;
    get scaleMultiplier(): PointSignal;
    autoScaleObject(sceneObject: SceneObjectBase, preferredX?: number, preferredY?: number, preferredZ?: number): void;
}
export declare function createScaler(baseWidth: number, baseHeight: number): Scaler;
/**
 * The width of the screen resolution in ScalarSignal.
 */
export declare const width: ScalarSignal;
/**
 * The height of the screen resolution in ScalarSignal.
 */
export declare const height: ScalarSignal;
/**
 * CameraInfo.previewScreenScale.
 */
export declare const screenScale: ScalarSignal;
/**
 * The percentage [0-1] of position X in screen coordinates. `0` is left, `1` is right.
 */
export declare function percentToFocalPlaneX(percent: ScalarSignal | number): Promise<ScalarSignal>;
/**
 * The percentage [0-1] of position Y in screen coordinates. `0` is top, `1` is bottom.
 */
export declare function percentToFocalPlaneY(percent: ScalarSignal | number): Promise<ScalarSignal>;
/**
 * The percentage [0-1] of position in screen coordinates. `(0, 0)` is left top, `(1, 1)` is right bottom.
 */
export declare function percentToFocalPlane(percentLocation: Point2DSignal): Promise<PointSignal>;
/**
 * The percentage [0-1] of position X in canvas coordinates. `0` is left, `1` is right.
 */
export declare function percentToCanvasX(percent: ScalarSignal | number): ScalarSignal;
/**
 * The percentage [0-1] of position Y in canvas coordinates. `0` is top, `1` is bottom.
 */
export declare function percentToCanvasY(percent: ScalarSignal | number): ScalarSignal;
/**
 * The percentage [0-1] of position in canvas coordinates. `(0, 0)` is left top, `(1, 1)` is right bottom.
 */
export declare function percentToCanvas(location: Point2DSignal): PointSignal;
export declare function canvasToPercentX(positionX: ScalarSignal | number, centerRef?: PlanarObject): ScalarSignal;
export declare function canvasToPercentY(positionY: ScalarSignal | number, centerRef?: PlanarObject): ScalarSignal;
export declare function canvasToPercent(location: PointSignal, centerRef?: PlanarObject): Point2DSignal;
export declare function focalPlaneXToPercent(positionX: ScalarSignal | number): Promise<ScalarSignal>;
export declare function focalPlaneYToPercent(positionY: ScalarSignal | number): Promise<ScalarSignal>;
export declare function focalPlaneToPercent(position: PointSignal): Promise<Point2DSignal>;
/**
 * Convert canvas position to focal plane position.
 */
export declare function canvasToFocalPlane(position: PointSignal, centerRef?: PlanarObject): Promise<PointSignal>;
export declare function focalPlaneToCanvas(position: PointSignal, centerRef?: PlanarObject): Promise<PointSignal>;
/**
 * The fullscreen size on Focal Plane.
 */
export declare function getFullscreenSize(): Promise<PointSignal>;
/**
 * The current width of the screen window in pixels.
 */
export declare function getWidth(): Promise<number>;
/**
 * The current height of the screen window in pixels.
 */
export declare function getHeight(): Promise<number>;
/**
 * Represents a display resolution.
 */
export declare function getResolution(): Promise<{
    width: number;
    height: number;
    toString(): string;
}>;
/**
 * Get the same position as faceMesh from tracker's cameraTransform.
 */
export declare function cameraTransformToFocalDistance(cameraTransformPosition: PointSignal): Promise<PointSignal>;
/**
 * Get screen position of tracker's cameraTransform.
 */
export declare function cameraTransformToFocalPlane(cameraTransformPosition: PointSignal): Promise<PointSignal>;
export declare function cameraTransformToPercent(cameraTransformPosition: PointSignal): Promise<Point2DSignal>;
/**
 * Convert position of tracker's cameraTransform to canvas.
 * @param {SceneObjectBase=} centerRef Reference object's width and height to offset.
 */
export declare function cameraTransformToCanvas(cameraTransformPosition: PointSignal, centerRef?: PlanarObject): Promise<PointSignal>;
/**
 * Convert position of tracker's cameraTransform to world.
 */
export declare function cameraTransformToWrold(cameraTransformPosition: PointSignal): Promise<PointSignal>;
/**
 * Convert position of worldTransform to focal plane position.
 */
export declare function worldToFocalPlane(worldPosition: PointSignal): Promise<PointSignal>;
/**
 * Convert position of worldTransform to canvas position.
 */
export declare function worldToCanvas(worldPosition: PointSignal, centerRef?: PlanarObject): Promise<PointSignal>;
/**
 * Convert position of worldTransform to focal position in [0-1] percent.
 */
export declare function worldToPercent(worldPosition: PointSignal): Promise<Point2DSignal>;
/**
 * Convert position of worldTransform to focal position in [0-1] percent.
 * @deprecated It's typo of `worldToPercent`
 */
export declare function worldToPercet(worldPosition: PointSignal): Promise<Point2DSignal>;
/**
 * Get the scale that make the plane in screen space look the same size as the plane in 3d space.
 */
export declare function getPerspectiveScale(worldPosition: PointSignal): Promise<PointSignal>;
export {};
