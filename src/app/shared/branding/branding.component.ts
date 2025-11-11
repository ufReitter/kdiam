import { Component, Input } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'kd-branding',
  standalone: false,
  templateUrl: './branding.component.html',
  styleUrls: ['./branding.component.scss'],
})
export class BrandingComponent {
  @Input() brand: string;
  @Input() link: string;
  constructor(public dS: DataService) {}
}
