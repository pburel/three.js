import { Vector2 } from "three";
import { ReplaySubject } from "rxjs";

export class MouseManager {
  /** The mouse vector. */
  public mouse: Vector2;
  public onMouseDown$ = new ReplaySubject<Vector2>(1);
  public onMouseMove$ = new ReplaySubject<Vector2>(1);
  public onMouseUp$ = new ReplaySubject<Vector2>(1);

  private domElement: HTMLElement | Document;

  private handle_mousedown: (e: any) => void;
  private handle_mousemove: (e: any) => void;
  private handle_mouseup: (e: any) => void;

  constructor(_domElement: HTMLElement | Window) {
    this.mouse = new Vector2();
    this.domElement = _domElement as any;

    this.onMouseDown$ = new ReplaySubject<Vector2>(1);
    this.onMouseMove$ = new ReplaySubject<Vector2>(1);
    this.onMouseUp$ = new ReplaySubject<Vector2>(1);

    if (this.domElement) {
      this.handle_mousedown = e => this.onMouseDown(e);
      this.handle_mousemove = e => this.onMouseMove(e);
      this.handle_mouseup = e => this.onMouseUp(e);

      this.domElement.addEventListener(
        "mousedown",
        this.handle_mousedown,
        false
      );
      this.domElement.addEventListener(
        "mousemove",
        this.handle_mousemove,
        false
      );
      this.domElement.addEventListener("mouseup", this.handle_mouseup, false);
    }
  }

  /**
   * On mouse down event.
   * @param event the mouse event
   */
  public onMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1;
    this.onMouseDown$.next(this.mouse);
  }

  /**
   * On mouse move event.
   * @param event the mouse event
   */
  public onMouseMove(event: MouseEvent) {
    event.preventDefault();
    this.mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1;
    this.onMouseMove$.next(this.mouse);
  }

  /**
   * On mouse up event.
   * @param event the mouse event
   */
  public onMouseUp(event: MouseEvent) {
    event.preventDefault();
    this.mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1;
    this.onMouseUp$.next(this.mouse);
  }

  public dispose() {
    this.domElement.removeEventListener(
      "mousemove",
      this.handle_mousemove,
      false
    );
    this.domElement.removeEventListener(
      "mousedown",
      this.handle_mousedown,
      false
    );
    this.domElement.removeEventListener("mouseup", this.handle_mouseup, false);
  }
}
