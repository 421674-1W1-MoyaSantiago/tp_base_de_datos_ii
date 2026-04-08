import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceStatus } from '../../core/models/models';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timer-display font-mono text-2xl font-bold">
      {{displayTime()}}
    </div>
  `,
  styles: [`
    .timer-display {
      padding: 8px 16px;
      border-radius: 4px;
      background-color: #f5f5f5;
      display: inline-block;
    }
  `]
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() startTime?: string;
  @Input() endTime?: string;
  @Input() status!: ServiceStatus;

  displayTime = signal<string>('00:00:00');
  private intervalId?: number;

  ngOnInit() {
    if (this.status === ServiceStatus.IN_PROGRESS && this.startTime) {
      this.startTimer();
    } else if ((this.status === ServiceStatus.COMPLETED || this.status === ServiceStatus.DELIVERED) 
               && this.startTime && this.endTime) {
      this.calculateDuration();
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startTimer() {
    this.updateElapsedTime();
    this.intervalId = window.setInterval(() => {
      this.updateElapsedTime();
    }, 1000);
  }

  private updateElapsedTime() {
    if (!this.startTime) return;
    
    const start = new Date(this.startTime).getTime();
    const now = new Date().getTime();
    const elapsed = Math.floor((now - start) / 1000);
    
    this.displayTime.set(this.formatSeconds(elapsed));
  }

  private calculateDuration() {
    if (!this.startTime || !this.endTime) return;
    
    const start = new Date(this.startTime).getTime();
    const end = new Date(this.endTime).getTime();
    const duration = Math.floor((end - start) / 1000);
    
    this.displayTime.set(this.formatSeconds(duration));
  }

  private formatSeconds(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  }
}
