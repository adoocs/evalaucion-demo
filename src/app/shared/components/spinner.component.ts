import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../utils/loading.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    @if (loadingService.loading()) {
      <div class="spinner-overlay">
        <p-progressSpinner 
          styleClass="w-4rem h-4rem" 
          strokeWidth="8"
          fill="var(--surface-ground)" 
          animationDuration=".5s">
        </p-progressSpinner>
      </div>
    }
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
  `]
})
export class SpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}