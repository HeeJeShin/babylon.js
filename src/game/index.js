


var currentColor = new BABYLON.Color3(0.5, 0.5, 1);
var moveSpeed = 0.0002;
var shieldActive = false;
var bulletActive = false;
var boostActive = false;

// Find child mesh inside of ship
var findMesh = (ship, childName) => {
    return ship.getChildMeshes(false, (child) => {
        if (child.name == childName) {
            return true;
        }
        else {
            return false;
        }
    })[0];
}

// Activate shield animation
var modifyShield = (scene, ship) => {
    if (!shieldActive) {
        shieldActive = true;

        const shield = findMesh(ship, "shield");

        setTimeout(async () => {
            const anim = scene.beginAnimation(shield, 0, 90, false);

            await anim.waitAsync();
            shieldActive = false;
        });  
    }
}

// Change color of ship components
var changeShipColors = (ship, color) => {
    const blasterLeft = findMesh(ship, "blasterLeft");
    const bulletLeft = findMesh(ship, "bulletLeft");
    const jet = findMesh(ship, "jet");
    const shield = findMesh(ship, "shield");

    jet.material.emissiveColor = color;
    blasterLeft.material.diffuseColor = color;
    shield.material.emissiveColor = color;
    bulletLeft.material.emissiveColor = color;
}

// Activate blaster animation
var fireBlasters = (scene, ship) => {
    if (!bulletActive) {
        bulletActive = true;
        const bulletLeft = findMesh(ship, "bulletLeft");

        setTimeout(async () => {
            const anim = scene.beginAnimation(bulletLeft, 0, 10, false);

            await anim.waitAsync();
            bulletLeft.position.y = 0;
            bulletActive = false;
        });
    }
}

// Activate Booster animation
var activateBoost = (ship, color1, color2, camera) => {
    if (!boostActive) {
        boostActive = true;

        const particleSystem = findMesh(ship, "jet").getConnectedParticleSystems()[0];

        particleSystem.color1 = color1;
        particleSystem.color2 = color2;
        particleSystem.direction1 = new BABYLON.Vector3(0, -5, 0);
        const anim = scene.beginAnimation(camera, 0, 120, false);
        moveSpeed = 0.0004;

        setTimeout(() => {
            particleSystem.direction1 = new BABYLON.Vector3(0, -1, 0);
            moveSpeed = 0.0002;
        }, 3000);
        setTimeout(() => {
            boostActive = false;
        }, 4000);
    }
}

var turnLeft = (ship) => {
    if (ship.position.x > -5) {
        ship.position.x -= 0.04;
    }
}

var turnRight = (ship) => {
    if (ship.position.x < 5) {
        ship.position.x += 0.04;
    }
}

// Create all of the parts and animations for the ship
var createShip = (scene, camera) => {
    /*** Primary part of ship ***/
    const nose = BABYLON.MeshBuilder.CreateCylinder("nose", {height: 3, diameterTop: 0, diameterBottom: 1, tessellation: 4});
    
    /*** Tail and Jet Propulsion ***/
    const tail = BABYLON.MeshBuilder.CreateCylinder("tail", {height: 1, diameterTop: 1, diameterBottom: 0.5, tessellation: 4});
    tail.position.y = -2;
    tail.parent = nose;
    const jet =  BABYLON.MeshBuilder.CreateCylinder("jet", {height: 0.5, diameterTop: 0.4, diameterBottom: 0, tessellation: 4});
    jet.position.y = -0.75;
    jet.parent = tail;
    const jetMat = new BABYLON.StandardMaterial("jetMat", scene);
    jetMat.emissiveColor = currentColor;
    jetMat.alpha = 0.5;
    jet.material = jetMat;
    var gl = new BABYLON.GlowLayer("glow", scene);

    // Create a particle system
    const particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

    //Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);

    // Where the particles come from
    particleSystem.emitter = jet; // the starting object, the emitter
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.1, 0, 0); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.1, 0, 0); // To...

    // Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.5, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

    // Size of each particle (random between...
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.1;

    // Life time of each particle (random between...
    particleSystem.minLifeTime = 0.2;
    particleSystem.maxLifeTime = 1;

    // Emission rate
    particleSystem.emitRate = 2000;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new BABYLON.Vector3(0, -1, 0);

    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    // Speed
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;

    // Start the particle system
    particleSystem.start();

    const boostAnim = new BABYLON.Animation("boostAnim", "position.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const boostKeys = [];
    boostKeys.push({
        frame: 0,
        value: camera.position.z
    });
    boostKeys.push({
        frame: 5,
        value: camera.position.z
    });
    boostKeys.push({
        frame: 90,
        value: camera.position.z-1
    });
    boostKeys.push({
        frame: 120,
        value: camera.position.z
    });
    boostAnim.setKeys(boostKeys);
    camera.animations.push(boostAnim);

    /*** Blasters and bullets ***/
    const blasterMat = new BABYLON.StandardMaterial("blastMat", scene);
    blasterMat.diffuseColor = currentColor;

    const blasterLeft = BABYLON.MeshBuilder.CreateCylinder("blasterLeft", {height: 2, diameterTop: 0, diameterBottom: 0.75, tessellation: 4});
    blasterLeft.position = new BABYLON.Vector3(-0.75, -0.5, 0.25);
    blasterLeft.parent = nose;
    blasterLeft.material = blasterMat;

    const blasterRight = BABYLON.MeshBuilder.CreateCylinder("blasterRight", {height: 2, diameterTop: 0, diameterBottom: 0.75, tessellation: 4});
    blasterRight.position = new BABYLON.Vector3(0.75, -0.5, 0.25);
    blasterRight.parent = nose;
    blasterRight.material = blasterMat;

    const bulletLeft = BABYLON.MeshBuilder.CreateCylinder("bulletLeft", {diameter: 0.1, height: 0.5});
    const bulletRight = BABYLON.MeshBuilder.CreateCylinder("bulletRight", {diameter: 0.1, height: 0.5});
    bulletLeft.parent = blasterLeft;
    bulletRight.parent = bulletLeft;
    bulletRight.position.x = 1.5;

    const bulletMat = new BABYLON.StandardMaterial("bulletMaterial", scene);
    bulletMat.emissiveColor = currentColor;
    bulletLeft.material = bulletMat;
    bulletRight.material = bulletMat;
    const bulletAnim = new BABYLON.Animation("bulletAnim", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const bulletKeys = [];

    bulletKeys.push({
        frame: 0,
        value: 0
    });
    bulletKeys.push({
        frame: 30,
        value: 30
    });

    bulletAnim.setKeys(bulletKeys);
    bulletLeft.animations.push(bulletAnim);

    /*** Wings and Shield ***/
    const wingLeft = BABYLON.MeshBuilder.CreateCylinder("wLeft", {height: 3, diameterTop: 1, diameterBottom: 0, tessellation: 4});
    wingLeft.position.x = -1.75;
    wingLeft.position.y = -3;
    wingLeft.rotate(BABYLON.Axis.Z, -Math.PI / 4);
    wingLeft.parent = nose;

    const wingRight = BABYLON.MeshBuilder.CreateCylinder("wRight", {height: 3, diameterTop: 1, diameterBottom: 0, tessellation: 4});
    wingRight.position.x = 1.75;
    wingRight.position.y = -3;
    wingRight.rotate(BABYLON.Axis.Z, Math.PI / 4);
    wingRight.parent = nose;

    const shield = BABYLON.MeshBuilder.CreateSphere("shield", {diameterX: 7, diameterY: 8, diameterZ: 2});
    shield.position.y = -2;
    shield.parent = nose;
    const shieldMat = new BABYLON.StandardMaterial("shieldMat", scene);
    shieldMat.alpha = 0.0;
    shieldMat.emissiveColor = currentColor;
    shield.material = shieldMat;

    const shieldAnim = new BABYLON.Animation("shieldAnim", "material.alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const shieldKeys = [];

    shieldKeys.push({
        frame: 0,
        value: 0
    });
    shieldKeys.push({
        frame: 30,
        value: 0.1
    });
    shieldKeys.push({
        frame: 60,
        value: 0.1
    });
    shieldKeys.push({
        frame: 90,
        value: 0
    });

    shieldAnim.setKeys(shieldKeys);

    shield.animations.push(shieldAnim);

    nose.setPivotPoint(new BABYLON.Vector3(0, -2.25, 0));
    nose.rotate(BABYLON.Axis.X, Math.PI / 2);
    return nose;
}

// Create Skybox object
var createSkybox = (scene) => {
	const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
	const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
    const files = [
        "textures/Space/space_left.jpg",
        "textures/Space/space_up.jpg",
        "textures/Space/space_front.jpg",
        "textures/Space/space_right.jpg",
        "textures/Space/space_down.jpg",
        "textures/Space/space_back.jpg",
    ];
	skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture.CreateFromImages(files, scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	skyboxMaterial.disableLighting = true;
	skybox.material = skyboxMaterial;

    return skybox;
}

/*
 *
 * Create Scene section
 * This section contains code from the DeviceSourceManager.
 * Each part of the DSM that's used will have comments illustrating
 * how it can be used.
 */
var createScene = function () {
    const scene = new BABYLON.Scene(engine);
    /*
     * Constructor: At a bare minimum, all that you need to do to 
     * use the DeviceSourceManager is to create an instance of it.
     */
    const dsm = new BABYLON.DeviceSourceManager(engine);
    const skybox = createSkybox(scene);

    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 7, -15), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const ship = createShip(scene, camera);

    // Create and configure textblock with instructions
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const controlsText = new BABYLON.GUI.TextBlock();
    controlsText.text = "No connection to pilot controls.";
    controlsText.color = "white";
    controlsText.fontStyle = "bold";
    controlsText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    controlsText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    controlsText.fontSize = 24;
    advancedTexture.addControl(controlsText);

    /*
     * onAfterDeviceConnectedObservable:
     * One of two observables that works around a device being connected/added
     * to the DeviceSourceManager instance.  This observable activates after
     * the given device is connected.  The "device" parameter has two members, 
     * deviceType (Assigned type of connected device; BABYLON.DeviceType) and 
     * deviceSlot (Assigned slot of connected device; number).
     * 
     * The other connected observable is onBeforeDeviceConnectedObservable.
     */
    dsm.onDeviceConnectedObservable.add((device) => {
        let shieldButton = "n/a";
        let fireButton = "n/a";
        let boostButton = "n/a";

        switch(device.deviceType) {
            case BABYLON.DeviceType.Keyboard:
                currentColor = new BABYLON.Color3(1,0.5,0.5);
                controlsText.color = "red";
                shieldButton = "Z";
                fireButton = "Spacebar";
                boostButton = "X";
                controlsText.text = `Established link to ${BABYLON.DeviceType[device.deviceType]}\n`;
                controlsText.text += `Pilot Controls\nShield: ${shieldButton}\nFire: ${fireButton}\nBoost: ${boostButton}`;
                break;
            case BABYLON.DeviceType.Xbox:
                currentColor = new BABYLON.Color3(0.5,1,0.5);
                controlsText.color = "green";
                shieldButton = "A";
                fireButton = "X";
                boostButton = "B";
                controlsText.text = `Established link to ${BABYLON.DeviceType[device.deviceType]}\n`;
                controlsText.text += `Pilot Controls\nShield: ${shieldButton}\nFire: ${fireButton}\nBoost: ${boostButton}`;
                break;
            case BABYLON.DeviceType.DualShock:
                currentColor = new BABYLON.Color3(0.5,0.5,1);
                controlsText.color = "blue";
                shieldButton = "Cross";
                fireButton = "Square";
                boostButton = "Circle";
                controlsText.text = `Established link to ${BABYLON.DeviceType[device.deviceType]}\n`;
                controlsText.text += `Pilot Controls\nShield: ${shieldButton}\nFire: ${fireButton}\nBoost: ${boostButton}`;
                break;
        }

        changeShipColors(ship, currentColor);
    });

    /*
     * onAfterDeviceDisconnectedObservable:
     * One of two observables that works around a device being disconnected/removed
     * to the DeviceSourceManager instance.  This observable activates after
     * the given device is disconnected.  The "device" parameter has two members, 
     * deviceType (Assigned type of connected device; BABYLON.DeviceType) and 
     * deviceSlot (Assigned slot of connected device; number).
     * 
     * The other connected observable is onBeforeDeviceDisconnectedObservable.
     */
    dsm.onDeviceDisconnectedObservable.add((device) => {
        controlsText.color = "white";
        controlsText.text = `Lost connection to ${BABYLON.DeviceType[device.deviceType]}`;
    });

    // "Game" Loop
    scene.registerBeforeRender(() => {
        skybox.rotate(ship.rotationQuaternion, moveSpeed);

        /*
         * getDeviceSource and getInput:
         * At a minimum, you'll need to use the getInput function to read 
         * data from user input devices.
         * 
         * In Typescript, you can combine the getDeviceSource and getInput in the 
         * if statements into a single like by using the null-conditional operator.
         * 
         * e.g. if(dsm.getDeviceSource(BABYLON.DeviceType.Keyboard)?.getInput(90) == 1)
         */
        if (dsm.getDeviceSource(BABYLON.DeviceType.Keyboard)) {
            if (dsm.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(90) == 1) {
                currentColor = new BABYLON.Color3(1,0.5,0.5);
                modifyShield(scene, ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "red";
                controlsText.text = "Pilot Controls\nShield: Z\nFire: Spacebar\nBoost: X";
            }
            if (dsm.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(32) == 1) {
                currentColor = new BABYLON.Color3(1,0.5,0.5);
                fireBlasters(scene, ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "red";
                controlsText.text = "Pilot Controls\nShield: Z\nFire: Spacebar\nBoost: X";
            }
            if (dsm.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(88) == 1) {
                currentColor = new BABYLON.Color3(1,0.5,0.5);
                color1 = new BABYLON.Color4(1.0, 0.8, 0.8, 1.0);
                color2 = new BABYLON.Color4(1.0, 0.5, 0.5, 1.0);
                activateBoost(ship, color1, color2, camera);
                changeShipColors(ship, currentColor);
                controlsText.color = "red";
                controlsText.text = "Pilot Controls\nShield: Z\nFire: Spacebar\nBoost: X";
            }
            if (dsm.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(37) == 1) {
                currentColor = new BABYLON.Color3(1,0.5,0.5);
                turnLeft(ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "red";
                controlsText.text = "Pilot Controls\nShield: Z\nFire: Spacebar\nBoost: X";
            }
            else if (dsm.getDeviceSource(BABYLON.DeviceType.Keyboard).getInput(39) == 1) {
                currentColor = new BABYLON.Color3(1,0.5,0.5);
                turnRight(ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "red";
                controlsText.text = "Pilot Controls\nShield: Z\nFire: Spacebar\nBoost: X";
            }
        }

        if (dsm.getDeviceSource(BABYLON.DeviceType.Xbox)) {
            if (dsm.getDeviceSource(BABYLON.DeviceType.Xbox).getInput(BABYLON.XboxInput.A) == 1) {
                currentColor = new BABYLON.Color3(0.5,1,0.5);
                modifyShield(scene, ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "green";
                controlsText.text = "Pilot Controls\nShield: A\nFire: X\nBoost: B";
            }
            if (dsm.getDeviceSource(BABYLON.DeviceType.Xbox).getInput(BABYLON.XboxInput.X) == 1) {
                currentColor = new BABYLON.Color3(0.5,1,0.5);
                fireBlasters(scene, ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "green";
                controlsText.text = "Pilot Controls\nShield: A\nFire: X\nBoost: B";
            }
            if (dsm.getDeviceSource(BABYLON.DeviceType.Xbox).getInput(BABYLON.XboxInput.B) == 1) {
                currentColor = new BABYLON.Color3(0.5,1,0.5);
                color1 = new BABYLON.Color4(0.8, 1.0, 0.8, 1.0);
                color2 = new BABYLON.Color4(0.5, 1.0, 0.5, 1.0);
                activateBoost(ship, color1, color2, camera);
                changeShipColors(ship, currentColor);
                controlsText.color = "green";
                controlsText.text = "Pilot Controls\nShield: A\nFire: X\nBoost: B";
            }
            if (dsm.getDeviceSource(BABYLON.DeviceType.Xbox).getInput(BABYLON.XboxInput.LStickXAxis) < -0.25) {
                currentColor = new BABYLON.Color3(0.5,1,0.5);
                turnLeft(ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "green";
                controlsText.text = "Pilot Controls\nShield: A\nFire: X\nBoost: B";
            }
            else if (dsm.getDeviceSource(BABYLON.DeviceType.Xbox).getInput(BABYLON.XboxInput.LStickXAxis) > 0.25) {
                currentColor = new BABYLON.Color3(0.5,1,0.5);
                turnRight(ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "green";
                controlsText.text = "Pilot Controls\nShield: A\nFire: X\nBoost: B";
            }
        }

        if (dsm.getDeviceSource(BABYLON.DeviceType.DualShock)) {
            if (dsm.getDeviceSource(BABYLON.DeviceType.DualShock).getInput(BABYLON.DualShockInput.Cross) == 1) {
                currentColor = new BABYLON.Color3(0.5,0.5,1);
                modifyShield(scene, ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "blue";
            }
            if (dsm.getDeviceSource(BABYLON.DeviceType.DualShock).getInput(BABYLON.DualShockInput.Square) == 1) {
                currentColor = new BABYLON.Color3(0.5,0.5,1);
                fireBlasters(scene, ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "blue";
                controlsText.text = "Pilot Controls\nShield: Cross\nFire: Square\nBoost: Circle";
            }
            if (dsm.getDeviceSource(BABYLON.DeviceType.DualShock).getInput(BABYLON.DualShockInput.Circle) == 1) {
                currentColor = new BABYLON.Color3(0.5,0.5,1);
                color1 = new BABYLON.Color4(0.8, 0.8, 1.0, 1.0);
                color2 = new BABYLON.Color4(0.5, 0.5, 1.0, 1.0);
                activateBoost(ship, color1, color2, camera);
                changeShipColors(ship, currentColor);
                controlsText.color = "blue";
                controlsText.text = "Pilot Controls\nShield: Cross\nFire: Square\nBoost: Circle";
            }
            if (dsm.getDeviceSource(BABYLON.DeviceType.DualShock).getInput(BABYLON.DualShockInput.LStickXAxis) < -0.25) {
                currentColor = new BABYLON.Color3(0.5,0.5,1);
                turnLeft(ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "green";
                controlsText.text = "Pilot Controls\nShield: A\nFire: X\nBoost: B";
            }
            else if (dsm.getDeviceSource(BABYLON.DeviceType.DualShock).getInput(BABYLON.DualShockInput.LStickXAxis) > 0.25) {
                currentColor = new BABYLON.Color3(0.5,0.5,1);
                turnRight(ship);
                changeShipColors(ship, currentColor);
                controlsText.color = "blue";
                controlsText.text = "Pilot Controls\nShield: Cross\nFire: Square\nBoost: Circle";
            }
        }
    });

    return scene;

};