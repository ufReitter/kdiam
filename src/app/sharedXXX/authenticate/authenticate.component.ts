import { Component } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-authenticate',
  standalone: false,
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.scss'],
})
export class AuthenticateComponent {
  failed = false;
  constructor(public pS: ProfileService, public dS: DataService) {}

  checkInGlobal() {
    const body = {
      cmd: 'global',
    };

    this.dS.serverApi('/elements/check', body).subscribe(
      (body) => this.checkoutAction(body),
      (error) => (this.dS.errorMessage = <any>error),
    );
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

  reload() {
    window.location.reload();
  }
}
