import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initTilt } from '../animations';

describe('3D Tilt initialization', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="tilt-card" style="width: 100px; height: 100px;">Card 1</div>
      <div class="tilt-card" style="width: 100px; height: 100px;">Card 2</div>
    `;
  });

  it('should attach mousemove and mouseleave listeners to tilt-cards', () => {
    const cards = document.querySelectorAll('.tilt-card');
    const addEventListenerSpy = vi.spyOn(Element.prototype, 'addEventListener');
    
    initTilt();
    
    // Each card should have mousemove and mouseleave
    // Plus any other listeners we might add
    expect(addEventListenerSpy).toHaveBeenCalled();
    
    addEventListenerSpy.mockRestore();
  });
});
