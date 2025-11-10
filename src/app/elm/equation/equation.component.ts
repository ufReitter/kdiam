import { Component, Input, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Elm, ElmNode } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-equation',
  templateUrl: './equation.component.html',
  styleUrls: ['./equation.component.scss'],
})
export class EquationComponent implements OnInit {
  @Input() node: ElmNode;
  @Input() elm: Elm;
  @Input() parent: Elm;

  constructor(
    private snackbar: MatSnackBar,
    public pS: ProfileService,
    public vS: ViewService,
    public dS: DataService,
  ) {}

  ngOnInit(): void {
    this.elm = this.node.elm;
  }
}
