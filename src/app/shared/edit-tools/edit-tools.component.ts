import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-edit-tools',
  standalone: false,
  templateUrl: './edit-tools.component.html',
  styleUrls: ['./edit-tools.component.scss'],
})
export class EditToolsComponent implements OnInit {
  constructor(
    @Inject(Router) private router: Router,
    public pS: ProfileService,
    public vS: ViewService,
    public dS: DataService,
  ) {}

  ngOnInit(): void {
    // if (!this.vS.editorIsLoaded) {
    //   this.router.navigate(
    //     [
    //       {
    //         outlets: {
    //           right: ['redit', 'inline'],
    //         },
    //       },
    //     ],
    //     {
    //       skipLocationChange: true,
    //     },
    //   );
    //   let delay2 = timer(1000).subscribe((t) => {
    //     this.router.navigate([
    //       {
    //         outlets: {
    //           right: null,
    //         },
    //       },
    //     ]);
    //   });
    // }
  }

  onChangeGroup(e) {
    this.pS.pref.save({ 'editor.activeEdit': e.value });
  }

  onChangeButton(e) {
    switch (e.value) {
      case 'inline':
        if (e.source._checked) {
          this.vS.inlineEditor = true;
          this.dS.rS.showEdits(true);
        } else {
          this.vS.inlineEditor = false;
        }
        this.dS.subject.cdArticle.next(true);
        break;
      case 'editor':
        if (e.source._checked) {
          this.router.navigate([
            {
              outlets: {
                right: [
                  'redit',
                  this.pS.pref.editor.right || 'editor',
                  this.dS.selEditElm?._eid.str || this.dS.selElm._eid.str,
                ],
              },
            },
          ]);
        } else {
          this.router.navigate([{ outlets: { right: null } }]);
        }
        break;

      default:
        break;
    }
  }
}
