import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-user-picker',
  templateUrl: './user-picker.component.html',
  styleUrls: ['./user-picker.component.scss'],
})
export class UserPickerComponent implements OnInit {
  failed = false;
  privileg: string;

  constructor(public pS: ProfileService, public dS: DataService) {}

  ngOnInit() {
    if (this.pS.profile.role.editor) {
      this.privileg = 'edit';
    } else {
      this.privileg = 'view';
    }
  }

  changePrivileg(e) {
    if (e.value === 'view') {
      this.pS.profile.role.user = true;
      this.pS.profile.role.editor = false;
    }
    if (e.value === 'edit') {
      this.pS.profile.role.user = true;
      this.pS.profile.role.editor = true;
    }
  }

  checkInGlobal() {
    this.dS.globalCheckIn();
  }

  checkoutAction(body) {
    console.log(body);
  }

  logout() {
    this.pS.logout();
    // this.router.navigate(['/']);
  }

  login(login) {
    if (!login) {
      return;
    }
    this.dS.serverApi('/auth/login', login).subscribe(
      (body) => this.loginAction(body),
      (error) => (this.dS.errorMessage = <any>error),
    );
  }

  loginAction(body) {
    if (body.success) {
      this.failed = false;
      localStorage.setItem('token', body.token);
      this.pS.profile = this.pS.getProfile(body.token);
    } else {
      this.failed = true;
    }
  }

  stopPropagation(event) {
    event.stopPropagation();
  }
}
