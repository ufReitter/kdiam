import { Component } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { LegacyProgressSpinnerMode as ProgressSpinnerMode } from '@angular/material/legacy-progress-spinner';
import { CalculationService } from '../../services/calculation.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent {
  progressColor: ThemePalette = 'accent';
  progressMode: ProgressSpinnerMode = 'indeterminate';
  progressValue = 0;

  constructor(public dS: DataService, public cS: CalculationService) {}
}
