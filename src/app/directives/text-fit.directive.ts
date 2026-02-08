import { Directive, ElementRef, inject, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTextFit]',
  standalone: true,
})
export class TextFitDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private debounceTimer?: number;
  private readonly MIN_FONT_SIZE = 12;
  private readonly MAX_FONT_SIZE_LANDSCAPE = 200;
  private readonly MAX_FONT_SIZE_PORTRAIT = 100;
  private readonly DEBOUNCE_MS = 16;

  private get maxFontSize(): number {
    return window.innerWidth > window.innerHeight
      ? this.MAX_FONT_SIZE_LANDSCAPE
      : this.MAX_FONT_SIZE_PORTRAIT;
  }

  ngAfterViewInit(): void {
    this.setupStyles();
    requestAnimationFrame(() => this.fitText());
    this.observeResize();
    this.observeMutations();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }
  }

  private setupStyles(): void {
    this.renderer.setStyle(this.el.nativeElement, 'white-space', 'nowrap');
    this.renderer.setStyle(this.el.nativeElement, 'width', '100%');
    this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
  }

  //listens for screen resize
  private observeResize(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.debouncedFitText();
    });
    this.resizeObserver.observe(this.el.nativeElement);
  }

  //listens for text input
  private observeMutations(): void {
    this.mutationObserver = new MutationObserver(() => {
      this.debouncedFitText();
    });
    this.mutationObserver.observe(this.el.nativeElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  //makes sure fitText is not triggered too often
  private debouncedFitText(): void {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = window.setTimeout(() => {
      requestAnimationFrame(() => this.fitText());
    }, this.DEBOUNCE_MS);
  }

  private fitText(): void {
    const element = this.el.nativeElement as HTMLElement;
    const text = element.textContent?.trim();

    if (!text) {
      return;
    }

    const containerWidth = element.clientWidth;
    if (containerWidth <= 0) {
      return;
    }

    this.renderer.setStyle(element, 'font-size', `${this.maxFontSize}px`);

    const textWidth = element.scrollWidth;

    //calculate optimal font size (largest possible)
    const ratio = containerWidth / textWidth;
    const optimalSize = Math.floor(this.maxFontSize * ratio);

    //makes sure font size is never too small or big
    const finalSize = Math.max(this.MIN_FONT_SIZE, Math.min(optimalSize, this.maxFontSize));

    this.renderer.setStyle(element, 'font-size', `${finalSize}px`);
  }
}
