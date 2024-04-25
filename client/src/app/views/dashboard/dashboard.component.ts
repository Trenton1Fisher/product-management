import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface DashboardInfo {
  id: number,
  total: bigint,
  totalInventory: bigint,
}

interface Product {
  id: number,
  name: string,
  price: bigint,
  quantity: bigint,
  img: string,
}

interface DashboardReturn {
  dashboard: DashboardInfo
  products: Product[],
}

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
  dashboard_content?: DashboardReturn

  constructor(
    private http: HttpClient,
    private readonly supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
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
      this.http.get<DashboardReturn>(`http://localhost:8080/getDashboard?user_id=${this.user_id}`).subscribe(response => {
        if (!response) {
          this.loading = false
          this.dashboard_exists = false
          this.cdr.detectChanges()
          return
        }
          this.dashboard_exists = true
          this.dashboard_content = response
          this.loading = false
          this.cdr.detectChanges()
      });
    });
  }

  createDashboard(): void {
    console.log("called")
    this.http.post<DashboardReturn>(`http://localhost:8080/createDashboard`, { user_id: this.user_id }).subscribe(response => {
      if (!response) {
        console.log("We will handle this later");
        return;
      }
      this.dashboard_exists = true
      this.dashboard_content = response
      this.cdr.detectChanges()
    });
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.signOut();
      if (error) throw error;
      this.router.navigate(['/']);
    } catch (error) {
      alert(error);
    }
  }

}









