/**
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * @author George35mk / http://george35mk.com
 * Running this will allow you to drag three.js objects around the screen.
 */

import {
  EventDispatcher,
  Matrix4,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
  Object3D,
  Camera
} from "three";

/**
 * @example
 *
 * this.dragControls = new DragControls(
 *    this.cadObjects,
 *    this.camera,
 *    this.renderer.domElement
 *  );
 */
export class DragControls extends EventDispatcher {
  private _plane = new Plane();
  private _raycaster = new Raycaster();

  private _mouse = new Vector2();
  private _offset = new Vector3();
  private _intersection = new Vector3();
  private _worldPosition = new Vector3();
  private _inverseMatrix = new Matrix4();

  private _selected: any = null;
  private _hovered: any = null;

  public enabled: boolean;
  public scope = this;

  private _objects: Object3D[];
  private _camera: Camera;
  private _domElement: HTMLElement;

  // public handle_onDocumentMouseMove: (e) => void;
  public handle_onDocumentMouseMove: (e: any) => void;
  public handle_onDocumentMouseDown: (e: any) => void;
  public handle_onDocumentMouseCancel: (e: any) => void;
  public handle_onDocumentTouchMove: (e: any) => void;
  public handle_onDocumentTouchStart: (e: any) => void;
  public handle_onDocumentTouchEnd: (e: any) => void;

  constructor(_objects: Object3D[], _camera: Camera, _domElement: HTMLElement) {
    super();

    this._objects = _objects;
    this._camera = _camera;
    this._domElement = _domElement;

    this.activate();
    this.enabled = true;

    // this.activate = activate;
    // this.deactivate = deactivate;
    // this.dispose = dispose;
  }

  activate() {
    this.handle_onDocumentMouseMove = e => this.onDocumentMouseMove(e);
    this.handle_onDocumentMouseDown = e => this.onDocumentMouseDown(e);
    this.handle_onDocumentMouseCancel = e => this.onDocumentMouseCancel(e);
    this.handle_onDocumentTouchMove = e => this.onDocumentTouchMove(e);
    this.handle_onDocumentTouchStart = e => this.onDocumentTouchStart(e);
    this.handle_onDocumentTouchEnd = e => this.onDocumentTouchEnd(e);

    this._domElement.addEventListener(
      "mousemove",
      this.handle_onDocumentMouseMove,
      false
    );
    this._domElement.addEventListener(
      "mousedown",
      this.handle_onDocumentMouseDown,
      false
    );
    this._domElement.addEventListener(
      "mouseup",
      this.handle_onDocumentMouseCancel,
      false
    );
    this._domElement.addEventListener(
      "mouseleave",
      this.handle_onDocumentMouseCancel,
      false
    );
    this._domElement.addEventListener(
      "touchmove",
      this.handle_onDocumentTouchMove,
      false
    );
    this._domElement.addEventListener(
      "touchstart",
      this.handle_onDocumentTouchStart,
      false
    );
    this._domElement.addEventListener(
      "touchend",
      this.handle_onDocumentTouchEnd,
      false
    );
  }

  deactivate() {
    this._domElement.removeEventListener(
      "mousemove",
      this.handle_onDocumentMouseMove,
      false
    );
    this._domElement.removeEventListener(
      "mousedown",
      this.handle_onDocumentMouseDown,
      false
    );
    this._domElement.removeEventListener(
      "mouseup",
      this.handle_onDocumentMouseCancel,
      false
    );
    this._domElement.removeEventListener(
      "mouseleave",
      this.handle_onDocumentMouseCancel,
      false
    );
    this._domElement.removeEventListener(
      "touchmove",
      this.handle_onDocumentTouchMove,
      false
    );
    this._domElement.removeEventListener(
      "touchstart",
      this.handle_onDocumentTouchStart,
      false
    );
    this._domElement.removeEventListener(
      "touchend",
      this.handle_onDocumentTouchEnd,
      false
    );
  }

  dispose() {
    this.deactivate();
  }

  onDocumentMouseMove(event: MouseEvent) {
    event.preventDefault();

    const rect = this._domElement.getBoundingClientRect();

    this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(this._mouse, this._camera);

    if (this._selected && this.scope.enabled) {
      if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
        // this._selected.position.copy( this._intersection.sub( this._offset ).applyMatrix4( this._inverseMatrix ) ); // %%%
      }
      const pos = this._intersection
        .sub(this._offset)
        .applyMatrix4(this._inverseMatrix);
      this.scope.dispatchEvent({
        type: "drag",
        object: this._selected,
        position: pos
      });

      return;
    }

    this._raycaster.setFromCamera(this._mouse, this._camera);

    const intersects = this._raycaster.intersectObjects(this._objects, true);

    if (intersects.length > 0) {
      const object = intersects[0].object;

      this._plane.setFromNormalAndCoplanarPoint(
        this._camera.getWorldDirection(this._plane.normal),
        this._worldPosition.setFromMatrixPosition(object.matrixWorld)
      );

      if (this._hovered !== object) {
        this.scope.dispatchEvent({ type: "hoveron", object: object });

        this._domElement.style.cursor = "pointer";
        this._hovered = object;
      }
    } else {
      if (this._hovered !== null) {
        this.scope.dispatchEvent({ type: "hoveroff", object: this._hovered });

        this._domElement.style.cursor = "auto";
        this._hovered = null;
      }
    }
  }

  onDocumentMouseDown(event: MouseEvent) {
    event.preventDefault();

    this._raycaster.setFromCamera(this._mouse, this._camera);

    const intersects = this._raycaster.intersectObjects(this._objects, true);

    if (intersects.length > 0) {
      // >>> new code start
      let candidate;
      if (intersects[0].object.type === "Sprite") {
        candidate = intersects[0].object;
      } else if (intersects[1] && intersects[1].object.type === "Sprite") {
        candidate = intersects[1].object;
      } else {
        candidate = intersects[0].object;
      }
      this._selected = candidate;
      // >>> new code end

      // >>> old code start
      // this._selected = intersects[ 0 ].object;
      // >>> old code end

      if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
        this._inverseMatrix.getInverse(this._selected.parent.matrixWorld);
        this._offset
          .copy(this._intersection)
          .sub(
            this._worldPosition.setFromMatrixPosition(
              this._selected.matrixWorld
            )
          );
        // console.log("_offset: ", this._offset);
      }

      this._domElement.style.cursor = "move";

      this.scope.dispatchEvent({
        type: "dragstart",
        object: this._selected,
        intersects,
        offset: this._offset
      });
    }
  }

  onDocumentMouseCancel(event) {
    event.preventDefault();

    if (this._selected) {
      this.scope.dispatchEvent({ type: "dragend", object: this._selected });

      this._selected = null;
    }

    if (this._domElement) {
      this._domElement.style.cursor = this._hovered ? "pointer" : "auto";
    }
  }

  onDocumentTouchMove(event) {
    event.preventDefault();
    event = event.changedTouches[0];

    const rect = this._domElement.getBoundingClientRect();

    this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(this._mouse, this._camera);

    if (this._selected && this.scope.enabled) {
      if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
        this._selected.position.copy(
          this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix)
        );
      }

      this.scope.dispatchEvent({ type: "drag", object: this._selected });

      return;
    }
  }

  onDocumentTouchStart(event) {
    event.preventDefault();
    event = event.changedTouches[0];

    const rect = this._domElement.getBoundingClientRect();

    this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(this._mouse, this._camera);

    const intersects = this._raycaster.intersectObjects(this._objects, true);

    if (intersects.length > 0) {
      this._selected = intersects[0].object;

      this._plane.setFromNormalAndCoplanarPoint(
        this._camera.getWorldDirection(this._plane.normal),
        this._worldPosition.setFromMatrixPosition(this._selected.matrixWorld)
      );

      if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
        this._inverseMatrix.getInverse(this._selected.parent.matrixWorld);
        this._offset
          .copy(this._intersection)
          .sub(
            this._worldPosition.setFromMatrixPosition(
              this._selected.matrixWorld
            )
          );
      }

      this._domElement.style.cursor = "move";

      this.scope.dispatchEvent({ type: "dragstart", object: this._selected });
    }
  }

  onDocumentTouchEnd(event) {
    event.preventDefault();

    if (this._selected) {
      this.scope.dispatchEvent({ type: "dragend", object: this._selected });

      this._selected = null;
    }

    this._domElement.style.cursor = "auto";
  }
}

// DragControls.prototype = Object.create( EventDispatcher.prototype );
// DragControls.prototype.constructor = DragControls;

// export { DragControls };
