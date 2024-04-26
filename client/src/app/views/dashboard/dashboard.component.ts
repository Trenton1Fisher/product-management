import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

interface DashboardInfo {
  id: number,
  total: number,
  totalInventory: bigint,
}

interface Product {
  id: number,
  name: string,
  description: string
  price: number,
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
  imports: [CommonModule, ReactiveFormsModule],
  providers: [HttpClientModule]
})
export class Dashboard implements OnInit {
  session = this.supabase.session
  user_id?: string
  dashboard_exists = false
  page_loading = false
  form_loading = false
  openAddProduct = false
  openEditProduct = false
  dashboard_content?: DashboardReturn

  addProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]]
  })

  constructor(
    private http: HttpClient,
    private readonly supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private readonly formBuilder: FormBuilder,
  ) {
    this.user_id = ""
  }

  ngOnInit(): void {
    this.page_loading = true
    this.supabase.authChanges((_, session) => {
      this.session = session;
      if (!session) {
        this.router.navigate(['/']);
        return
      }
      this.user_id = session?.user.id
      this.http.get<DashboardReturn>(`http://localhost:8080/getDashboard?user_id=${this.user_id}`).subscribe(response => {
        if (!response) {
          this.page_loading = false
          this.dashboard_exists = false
          this.cdr.detectChanges()
          return
        }
        this.dashboard_exists = true
        this.dashboard_content = response
        this.page_loading = false
        this.cdr.detectChanges()
      });
    });
  }

  createDashboard(): void {
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

  addProduct(): void {
    const name = this.addProductForm.value.name as string
    const description = this.addProductForm.value.description as string
    const price = this.addProductForm.value.price as number
    const quantity = this.addProductForm.value.quantity as number

    if (!name || !quantity || !price) {
      return
    }
    console.log(name, description, price, quantity)
    this.form_loading = true
    this.http.post<{ dashboard: DashboardInfo, product: Product }>("http://localhost:8080/addProduct", {
      name: name,
      description: description,
      price: price,
      quantity: quantity,
      dashboard_id: this.dashboard_content?.dashboard.id
    }).subscribe(response => {
      if (!response) {
        alert("Unknown Error Please Double All Form Fields Are Filled or Refresh Page")
        this.form_loading = false
        return;
      }
      if (this.dashboard_content) {
        this.dashboard_content.products.push(response.product)
        this.dashboard_content.dashboard = response.dashboard
        this.addProductForm.reset
        this.openAddProduct = false
        this.form_loading = false
        this.cdr.detectChanges()
      }
    });
  }

  editProduct(): void {
  }

  deleteProduct(product_id: number): void {
    this.http.post<DashboardInfo>("http://localhost:8080/deleteProduct", {
      product_id: product_id,
      dashboard_id: this.dashboard_content?.dashboard.id
    }).subscribe(response => {
      if (!response) {
        alert("Unknown Error Please Refresh the Page")
        return
      }
      if (this.dashboard_content) {
        this.dashboard_content.dashboard = response
        const temp = this.dashboard_content.products.filter((product: Product) => {
          return product.id !== product_id;
        });
        this.dashboard_content.products = temp
        this.cdr.detectChanges()
      }
    })
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

  toggleAddModel(): void {
    this.openAddProduct = !this.openAddProduct
    this.addProductForm.reset()
    this.cdr.detectChanges()
  }

  toggleEditModel(): void {
    this.openEditProduct = !this.openEditProduct
  }

}









