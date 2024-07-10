import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductImage } from '../../components/productImage/productImage.component';

interface DashboardInfo {
  id: number,
  total: number,
  totalInventory: number,
}

interface Product {
  id: number,
  name: string,
  description: string
  price: number,
  quantity: number,
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
  imports: [CommonModule, ReactiveFormsModule, ProductImage],
  providers: [HttpClientModule]
})
export class Dashboard implements OnInit {
  session = this.supabase.session
  user_id?: string
  edit_id = 0
  dashboard_exists = false
  page_loading = false
  form_loading = false
  openAddProduct = false
  openEditProduct = false
  selectedFile: File | null = null;
  dashboard_content?: DashboardReturn

  addProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
  })

  editProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    imgUrl: ''
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

  async addProduct(): Promise<void> {
    const name = this.addProductForm.value.name as string
    const description = this.addProductForm.value.description as string
    const price = this.addProductForm.value.price as number
    const quantity = this.addProductForm.value.quantity as number

    if (!name || !quantity || !price) {
      return
    }

    this.form_loading = true
    this.cdr.detectChanges()
    if(this.selectedFile){
      try{
        const { error } = await this.supabase.addImage(this.selectedFile.name, this.selectedFile)
        if(error){
          console.log(error.message)
        }
      }catch(error){
        console.log(error)
      }
    }
    this.http.post<{ dashboard: DashboardInfo, product: Product }>("http://localhost:8080/addProduct", {
      name: name,
      description: description,
      price: price,
      quantity: quantity,
      dashboard_id: this.dashboard_content?.dashboard.id,
      imgURL: this.selectedFile?.name
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
        this.selectedFile = null
        this.cdr.detectChanges()
      }
    });
  }

  async editProduct(): Promise<void> {
    if (this.edit_id === 0) {
      return
    }
    this.form_loading = true
    this.cdr.detectChanges()
    const name = this.editProductForm.value.name as string
    const description = this.editProductForm.value.description as string
    const price = this.editProductForm.value.price as number
    const quantity = this.editProductForm.value.quantity as number
    const imgUrl = this.editProductForm.value.imgUrl as string

    if(this.selectedFile){
      try{
        await this.supabase.deleteImage(imgUrl)
        const {data, error} = await this.supabase.addImage(this.selectedFile.name, this.selectedFile)
        if(error){
          console.log(error.message)
        }
      }catch(error){
        console.log(error)
      }
    }

    this.http.post<DashboardInfo>("http://localhost:8080/updateProduct", {
      dashboard_id: this.dashboard_content?.dashboard.id,
      product_id: this.edit_id,
      name: name,
      description: description,
      price: price,
      quantity: quantity,
      imgURL: this.selectedFile?.name
    }).subscribe(response => {
      if(!response){
        alert("Unknown Error Please Refresh the Page")
        return
      }
      if(this.dashboard_content){
        this.dashboard_content.dashboard = response
        const item = this.dashboard_content.products.find(item => item.id === this.edit_id)
        if(item){
          item.name = name
          item.description = description
          item.price = price
          item.quantity = quantity
          item.img = this.selectedFile?.name || ''
        }
        this.editProductForm.reset
        this.openEditProduct = false
        this.selectedFile = null
        this.form_loading = false
        this.cdr.detectChanges()
      }
        this.form_loading = false
        this.cdr.detectChanges()
    })

  }

  async deleteProduct(product_id: number, imgUrl: string): Promise<void> {
    console.log(imgUrl)
    const {error} = await this.supabase.deleteImage(imgUrl)
    if(error){
      console.log(error.message)
    }
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
    this.selectedFile = null
    this.addProductForm.reset()
    this.cdr.detectChanges()
  }

  toggleEditModel(id: number, name: string, description: string, price: number, quantity: number, imgUrl: string) {
    this.edit_id = id
    this.selectedFile = null
    this.editProductForm.setValue({
      name: name,
      description: description,
      price: price,
      quantity: quantity,
      imgUrl: imgUrl
    })
    this.openEditProduct = !this.openEditProduct;
    this.cdr.detectChanges();
  }

  closeEditModel(): void {
    this.openEditProduct = !this.openEditProduct;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
}
}
