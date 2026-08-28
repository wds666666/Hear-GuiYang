import * as THREE from 'three';
import { resolveMove, snapToWalkable } from './bounds.js';

const DEFAULT_UP = new THREE.Vector3(0, 1, 0);
const DRAG_SENSITIVITY = 0.004;

/**
 * Fly-through controls: WASD in the view plane, Space/C along the scene up
 * axis, mouse look via click-drag (cursor stays visible).
 * Works with an arbitrary up vector, which matters here because
 * INRIA-style .ply scenes are Y-down.
 */
export class FirstPersonControls {
  constructor(camera, domElement, up) {
    this.camera = camera;
    this.dom = domElement;
    this.up = up.clone().normalize();

    this.yaw = 0;
    this.pitch = 0;
    this.speed = 1;
    this.baseSpeed = 1;
    this.target = new THREE.Vector3();

    this.dragging = false;
    this._touch = null;
    this.keys = new Set();

    this.onSpeedChange = () => {};

    this._basis = new THREE.Quaternion();
    this._basisInv = new THREE.Quaternion();
    this._qYaw = new THREE.Quaternion();
    this._qPitch = new THREE.Quaternion();
    this._forward = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this._move = new THREE.Vector3();
    this._home = { position: new THREE.Vector3(), yaw: 0, pitch: 0, speed: 1 };
    this._grid = null;
    this._listeners = [];

    this._rebuildBasis();
    this._bind();
    this._apply();
  }

  _rebuildBasis() {
    this._basis.setFromUnitVectors(DEFAULT_UP, this.up);
    this._basisInv.copy(this._basis).invert();
    this.camera.up.copy(this.up);
  }

  /** Point the camera at a world-space position. */
  lookAt(point) {
    this._forward.copy(point).sub(this.camera.position).normalize();
    this._forwardToAngles();
    this._apply();
  }

  _forwardToAngles() {
    const local = this._forward.clone().applyQuaternion(this._basisInv);
    this.pitch = Math.asin(THREE.MathUtils.clamp(local.y, -1, 1));
    this.yaw = Math.atan2(-local.x, -local.z);
  }

  /** Scale movement speed to the size of the loaded scene. */
  setSpeedScale(radius) {
    this.baseSpeed = THREE.MathUtils.clamp(radius * 0.45, 0.15, 60);
    this.speed = this.baseSpeed;
    this.onSpeedChange(this.speed / this.baseSpeed);
  }

  /** Restore a saved position and look direction. */
  setView({ position, yaw, pitch }) {
    this.camera.position.fromArray(position);
    this.yaw = yaw;
    this.pitch = pitch;
    this._constrain();
    this._apply();
  }

  setCollider(grid) {
    this._grid = grid ?? null;
  }

  _constrain() {
    if (this._grid) snapToWalkable(this._grid, this.camera.position);
  }

  saveHome() {
    this._home.position.copy(this.camera.position);
    this._home.yaw = this.yaw;
    this._home.pitch = this.pitch;
    this._home.speed = this.speed;
  }

  goHome() {
    this.camera.position.copy(this._home.position);
    this.yaw = this._home.yaw;
    this.pitch = this._home.pitch;
    this.speed = this._home.speed;
    this._apply();
    this.onSpeedChange(this.speed / this.baseSpeed);
  }

  flipUp() {
    this._currentForward(this._forward);
    this.up.negate();
    this._rebuildBasis();
    this._forwardToAngles();
    this._apply();
  }

  _currentForward(out) {
    return out.set(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
  }

  _apply() {
    this._qYaw.setFromAxisAngle(DEFAULT_UP, this.yaw);
    this._qPitch.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
    this.camera.quaternion
      .copy(this._basis)
      .multiply(this._qYaw)
      .multiply(this._qPitch);
  }

  update(dt) {
    const k = this.keys;
    let f = 0;
    let r = 0;
    let u = 0;

    if (k.has('KeyW') || k.has('ArrowUp')) f += 1;
    if (k.has('KeyS') || k.has('ArrowDown')) f -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) r += 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) r -= 1;
    if (k.has('Space')) u += 1;
    if (k.has('KeyC')) u -= 1;

    if (f === 0 && r === 0 && u === 0) return;

    this._currentForward(this._forward);
    this._right.crossVectors(this._forward, this.up).normalize();

    this._move
      .set(0, 0, 0)
      .addScaledVector(this._forward, f)
      .addScaledVector(this._right, r)
      .addScaledVector(this.up, u);

    if (this._move.lengthSq() === 0) return;

    const boost = k.has('ShiftLeft') || k.has('ShiftRight') ? 3.5 : 1;
    this._move.normalize().multiplyScalar(this.speed * boost * dt);
    if (this._grid) resolveMove(this._grid, this.camera.position, this._move);
    else this.camera.position.add(this._move);
  }

  _look(dx, dy, sensitivity) {
    this.yaw -= dx * sensitivity;
    this.pitch -= dy * sensitivity;
    this._apply();
  }

  _listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this._listeners.push(() => target.removeEventListener(type, handler, options));
  }

  _bind() {
    const dom = this.dom;

    this._listen(document, 'mousemove', (event) => {
      if (this.dragging) this._look(event.movementX, event.movementY, DRAG_SENSITIVITY);
    });
    this._listen(dom, 'mousedown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      this.dragging = true;
    });
    this._listen(window, 'mouseup', () => {
      this.dragging = false;
    });
    this._listen(dom, 'touchstart', (event) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      event.preventDefault();
      this.dragging = true;
      this._touch = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });
    this._listen(window, 'touchmove', (event) => {
      if (!this.dragging || !this._touch) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      this._look(touch.clientX - this._touch.x, touch.clientY - this._touch.y, DRAG_SENSITIVITY);
      this._touch = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });
    this._listen(window, 'touchend', () => {
      this.dragging = false;
      this._touch = null;
    });
    this._listen(dom, 'wheel', (event) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      this.speed = THREE.MathUtils.clamp(
        this.speed * factor,
        this.baseSpeed * 0.05,
        this.baseSpeed * 20,
      );
      this.onSpeedChange(this.speed / this.baseSpeed);
    }, { passive: false });
    this._listen(dom, 'contextmenu', (event) => event.preventDefault());
    this._listen(window, 'keydown', (event) => {
      if (event.code === 'Space') event.preventDefault();
      this.keys.add(event.code);
      if (event.code === 'KeyR') this.goHome();
      if (event.code === 'KeyF') this.flipUp();
    });
    this._listen(window, 'keyup', (event) => this.keys.delete(event.code));
    this._listen(window, 'blur', () => this.keys.clear());
  }

  dispose() {
    this._listeners.splice(0).forEach((remove) => remove());
    this.keys.clear();
    this.dragging = false;
  }
}
