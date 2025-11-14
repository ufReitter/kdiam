import { Component } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-project-picker',
  standalone: false,
  templateUrl: './project-picker.component.html',
  styleUrls: ['./project-picker.component.scss'],
})
export class ProjectPickerComponent {
  edit: boolean;

  constructor(public pS: ProfileService, public dS: DataService) {}

  onProjectChanged(project) {
    this.pS.projSub.next(project);
  }

  setEditDesign(event) {
    event.stopPropagation();
    this.edit = true;
  }
  editDesign(event) {
    this.pS.selectedProject.update({ design: this.dS.selectedProject.design });
    this.edit = false;
  }

  addProject(event) {
    event.stopPropagation();
    this.pS.addProject();
  }

  stopPropagation(event) {}
}
