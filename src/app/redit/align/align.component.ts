import { Component, Input } from '@angular/core';
import { Elm } from 'src/app/engine/entity';
import { ReditService } from '../redit.service';

@Component({
  selector: 'kd-align',
  standalone: false,
  templateUrl: './align.component.html',
  styleUrls: ['./align.component.scss'],
})
export class AlignComponent {
  @Input() elm: Elm;
  @Input() keypath: string;
  @Input() obj: any;
  activeIcon: string = 'format_align_left';
  constructor(public rS: ReditService) {}

  ngOnChanges(): void {
    this.activeIcon = this.getActiveIcon(this.obj.align || 'left');
  }
  async changeAlign(align: string) {
    this.obj.align = align;
    this.activeIcon = this.getActiveIcon(align);
    await this.rS.save(this.elm, this.keypath);
  }
  getActiveIcon(align: string) {
    switch (align) {
      case 'left':
        return 'format_align_left';
        break;
      case 'center':
        return 'format_align_center';
        break;
      case 'right':
        return 'format_align_right';
        break;

      default:
        return 'format_align_left';
        break;
    }
  }
}
