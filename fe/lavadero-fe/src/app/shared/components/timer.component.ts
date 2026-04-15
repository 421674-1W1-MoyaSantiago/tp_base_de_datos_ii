import { Component, input, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceStatus } from '../../core/models/models';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timer-container">
      <div class="timer-segment">
        <span class="timer-value">{{ displayTime() }}</span>
      </div>
      @if (status() === 'IN_PROGRESS') {
        <div class="pulse-indicator"></div>
      }
    </div>
  `,
  styles: [`
    .timer-container {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    }

    .timer-value {
      font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: 1px;
    }

    .pulse-indicator {
      width: 10px;
      height: 10px;
      background-color: #ef4444;
      border-radius: 50%;
      box-shadow: 0 0 0 rgba(239, 68, 68, 0.4);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
  `]
})
export class TimerComponent implements OnDestroy {
  // Signal Inputs (Angular 17.1+)
  startTime = input<string | undefined>();
  endTime = input<string | undefined>();
  status = input.required<ServiceStatus | string>();

  private now = signal(Date.now());
  private timerId = setInterval(() => this.now.set(Date.now()), 1000);

  displayTime = computed(() => {
    const startVal = this.startTime();
    const endVal = this.endTime();
    const statusVal = this.status();
    const currentNow = this.now();

    if (!startVal) return '00:00:00';

    const start = new Date(startVal).getTime();
    if (isNaN(start)) return '00:00:00';

    let diffMs = 0;

    if (statusVal === 'IN_PROGRESS') {
      diffMs = Math.max(0, currentNow - start);
    } else if (endVal) {
      const end = new Date(endVal).getTime();
      diffMs = Math.max(0, end - start);
    } else {
      // Fallback para servicios completados que aún no tienen endTime en la señal
      diffMs = Math.max(0, currentNow - start);
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  });

  ngOnDestroy() {
    clearInterval(this.timerId);
  }
}
