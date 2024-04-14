import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { CommonModule } from '@angular/common';
import AOS from 'aos';

@Component({
  standalone: true,
  selector: 'app-landingPage',
  templateUrl: './landingPage.component.html',
  styleUrls: ['./landingPage.component.css'],
  imports: [CommonModule],
})
export class LandingPage implements OnInit {
  session = this.supabase.session;
  constructor(private readonly supabase: SupabaseService) {}

  ngOnInit() {
    AOS.init({
      offset: -5,
    });
    this.supabase.authChanges((_, session) => (this.session = session));
  }
}
