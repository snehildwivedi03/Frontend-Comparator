import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-loader',
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center">
      <div class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
    </div>
  `,
})
export class LoaderComponent {}
