import { Directive, ElementRef, Renderer, AfterViewInit } from '@angular/core';
@Directive({
  selector: '[focus]'
})

export class FocusDirective implements AfterViewInit {
  constructor(private _el: ElementRef, private renderer: Renderer) {
  }

  ngAfterViewInit() {
    this.renderer.invokeElementMethod(this._el.nativeElement, 'focus');
  }
}
