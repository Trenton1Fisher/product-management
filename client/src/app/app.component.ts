import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'client';
  loading = false;
  session = this.supabase.session;

  constructor(
    private readonly supabase: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.supabase.authChanges((_, session) => (this.session = session));
  }

  async onSubmit(): Promise<void> {
    try {
      this.loading = true;
      const { error } = await this.supabase.signOut();
      if (error) throw error;
      this.router.navigate(['/']);
    } catch (error) {
      alert(error);
    } finally {
      this.loading = false;
    }
  }
}
