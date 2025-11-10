import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'kd-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css'],
})
export class DatabaseComponent {
  health: any;
  constructor(private http: HttpClient) {}
  async checkHealth() {
    let data$: any = this.http.get<any>(`/api/admin/healthdb?scope=all`);
    this.health = await lastValueFrom(data$);
    console.log(this.health);
  }

  async repair() {
    let data$: any = this.http.patch<any>(`/api/admin/repairdb?scope=all`, {
      db: 'kompendia',
    });
    const res = await lastValueFrom(data$);
    console.log(res);
  }
}
