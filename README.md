# Screen

![index](README.assets/index.gif)

**Screen** is a Spark AR script utility for the following purpose:

1. Convert coordinate **World Position**, **Canvas Position**, **Face Position** to **Focal Plane Position**.
2. Positioning 3D object (e.g. ![plane](README.assets/plane.png)) by percent `[0-1]`.
3. Scale 3D object to fit different screen size.



## Install

[![NPM](https://nodei.co/npm/sparkar-screen.png?compact=true)](https://nodei.co/npm/sparkar-screen.png?compact=true)

You can download script and import it into your Spark AR project, or use this with npm.

0. [Download Screen.ts](https://github.com/pofulu/sparkar-screen/releases/latest/download/Screen.ts)

1. Drag/Import it into your project. ([Spark AR support TypeScript since v105](https://sparkar.facebook.com/ar-studio/learn/scripting/typescript-support))

2. Import `Screen` module at the top of your script.

   ```javascript
   import * as Screen from './Screen';
   ```


3. You can also [Click Here to Download Sample Project (v115.1)](https://github.com/pofulu/sparkar-pftween/releases/latest/download/ScreenDemo.arprojpkg).



## Usage 

### Convert Tracker's Position

```js
const FaceTracking = require('FaceTracking');
const Screen = require('./Screen');

const face = FaceTracking.face(0);
const feature = face.cameraTransform.applyToPoint(face.leftEye.center);

(async function () {
    const position = await Screen.cameraTransformToFocalDistance(feature);
    const focalPlanePosition = await Screen.cameraTransformToFocalPlane(feature);
    const canvasPosition = await Screen.cameraTransformToCanvas(feature);
})();
```



### Positioning with Percent

```javascript
const Scene = require('Scene');
const Screen = require('./Screen');

(async function () {
    const positioning = await Scene.root.findFirst('positioning');
    positioning.transform.x = await Screen.percentToFocalPlaneX(.1);
    positioning.transform.y = await Screen.percentToFocalPlaneY(.2);
})();
```



### Scale Object by Screen Size

It's recommanded to use this with percentage positioning.

```js
const Scene = require('Scene');
const Screen = require('./Screen');

(async function () {
    const scaler = Screen.createScaler(9, 16);
    const scaleTarget = await Scene.root.findFirst('scaleTarget');
    scaler.autoScaleObject(scaleTarget);
})();
```



### Coordinate Converting Included

|                             | Canvas Position | Focal Plane Position | Percentage Position |
| --------------------------- | --------------- | -------------------- | ------------------- |
| **Canvas Position to**      | **–**           | ✔                    | ✔                   |
| **Focal Plane Position to** | ✔               | **–**                | ✔                   |
| **Percent Position to**     | ✔               | ✔                    | **–**               |
| **Face Position to**        | ✔               | ✔                    | ✔                   |
| **World Position to**       | ✔               | ✔                    | ✔                   |





## Donations

If this is useful for you, please consider a donation🙏🏼. One-time donations can be made with PayPal.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HW99ESSALJZ36)

