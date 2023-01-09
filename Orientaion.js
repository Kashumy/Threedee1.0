this.update = function() {
	// Z
	const alpha = scope.deviceOrientation.alpha ?
		THREE.Math.degToRad(scope.deviceOrientation.alpha) :
		0;

	// X'
	const beta = scope.deviceOrientation.beta ?
		THREE.Math.degToRad(scope.deviceOrientation.beta) :
		0;

	// Y''
	const gamma = scope.deviceOrientation.gamma ?
		THREE.Math.degToRad(scope.deviceOrientation.gamma) :
		0;

	// O
	const orient = scope.screenOrientation ?
		THREE.Math.degToRad(scope.screenOrientation) :
		0;

	const currentQ = new THREE.Quaternion().copy(scope.object.quaternion);

	setObjectQuaternion(currentQ, alpha, beta, gamma, orient);
	const currentAngle = Quat2Angle(currentQ.x, currentQ.y, currentQ.z, currentQ.w);

	// currentAngle.z = left - right
	this.rotateLeft((lastGamma - currentAngle.z) / 2);
	lastGamma = currentAngle.z;

	// currentAngle.y = up - down
	this.rotateUp(lastBeta - currentAngle.y);
	lastBeta = currentAngle.y;
}

function onDeviceOrientationChangeEvent(event) {
	scope.deviceOrientation = event;
}

window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

function onScreenOrientationChangeEvent(event) {
	scope.screenOrientation = window.orientation || 0;
}

window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
var setObjectQuaternion = function() {
	const zee = new THREE.Vector3(0, 0, 1);
	const euler = new THREE.Euler();
	const q0 = new THREE.Quaternion();
	const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

	return function(quaternion, alpha, beta, gamma, orient) {
		// 'ZXY' for the device, but 'YXZ' for us
		euler.set(beta, alpha, -gamma, 'YXZ');

		// Orient the device
		quaternion.setFromEuler(euler);

		// camera looks out the back of the device, not the top
		quaternion.multiply(q1);

		// adjust for screen orientation
		quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
	}
}();

function Quat2Angle(x, y, z, w) {
	let pitch, roll, yaw;

	const test = x * y + z * w;
	// singularity at north pole
	if (test > 0.499) {
		yaw = Math.atan2(x, w) * 2;
		pitch = Math.PI / 2;
		roll = 0;

		return new THREE.Vector3(pitch, roll, yaw);
	}

	// singularity at south pole
	if (test < -0.499) {
		yaw = -2 * Math.atan2(x, w);
		pitch = -Math.PI / 2;
		roll = 0;
		return new THREE.Vector3(pitch, roll, yaw);
	}

	const sqx = x * x;
	const sqy = y * y;
	const sqz = z * z;

	yaw = Math.atan2((2 * y * w) - (2 * x * z), 1 - (2 * sqy) - (2 * sqz));
	pitch = Math.asin(2 * test);
	roll = Math.atan2((2 * x * w) - (2 * y * z), 1 - (2 * sqx) - (2 * sqz));

	return new THREE.Vector3(pitch, roll, yaw);
}
