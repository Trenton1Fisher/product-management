import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule],
  providers: [HttpClientModule]
})
export class Dashboard implements OnInit {
  session = this.supabase.session
  user_id?: string
  dashboard_exists = false
  loading = false

  constructor(private http: HttpClient, private readonly supabase: SupabaseService, private router: Router, private cdr: ChangeDetectorRef) {
    this.user_id = ""
  }

  ngOnInit(): void {
    this.loading = true
    this.supabase.authChanges((_, session) => {
      this.session = session;
      if (!session) {
        this.router.navigate(['/']);
        return
      }
      this.user_id = session?.user.id
      this.http.get<any>(`http://localhost:8080/getDashboard?user_id=${this.user_id}`).subscribe(response => {
        if (!response) {
          this.loading = false
          this.dashboard_exists = false
          this.cdr.detectChanges()
          return
        }
          this.dashboard_exists = true
          console.log(response)
          this.loading = false
          this.cdr.detectChanges()
      });
    });
  }

  createDashboard(): void {
    console.log("called")
    this.http.post<any>(`http://localhost:8080/createDashboard`, { user_id: this.user_id }).subscribe(response => {
      if (!response) {
        console.log("We will handle this later");
        return;
      }
      console.log(response);
    });
  }

}









