
const Scene = require('Scene');
const FaceTracking = require('FaceTracking');
const Time = require('Time');
const Reactive = require('Reactive');
const Screen = require('./Screen');

(async function () {
    //––––––––––––––––––––––––––– How to convert tracker's position –––––––––––––––––––––––––––

    const eyeL = await Scene.root.findFirst('eyeL');
    const eyeL_screen = await Scene.root.findFirst('eyeL_screen');
    const eyeL_canvas = await Scene.root.findFirst('eyeL_canvas');

    const face = FaceTracking.face(0);
    const feature = face.cameraTransform.applyToPoint(face.leftEye.center);

    eyeL.transform.position = await Screen.cameraTransformToFocalDistance(feature);
    eyeL_screen.transform.position = await Screen.cameraTransformToFocalPlane(feature);
    eyeL_canvas.transform.position = await Screen.cameraTransformToCanvas(feature, eyeL_canvas);


    //––––––––––––––––––––––––––– How to positioning with percent –––––––––––––––––––––––––––

    const grid = await Scene.root.findFirst('grid');
    grid.transform.scale = await Screen.getFullscreenSize();

    const positioning = await Scene.root.findFirst('positioning');
    positioning.transform.x = await Screen.percentToFocalPlaneX(Time.ms.mod(4000).mul(0.00025));
    positioning.transform.y = await Screen.percentToFocalPlaneY(.2);

    const label = await Scene.root.findFirst('label');
    label.transform.position = await Screen.focalPlaneToCanvas(positioning.transform.position, label);
    label.text = Screen.canvasToPercentX(label.transform.x, label).format('{0:.2F}')
        .concat(', ')
        .concat(Screen.canvasToPercentY(label.transform.y, label).format('{0:.1F}'));


    //––––––––––––––––––––––––––– How to keep object's scale   –––––––––––––––––––––––––––

    const scaler = Screen.createScaler(9, 16);
    const scaleTarget = await Scene.root.findFirst('scaleTarget');
    scaleTarget.transform.position = await Screen.percentToFocalPlane(Reactive.point2d(0.75, 0.8));
    scaler.autoScaleObject(scaleTarget);
})();
