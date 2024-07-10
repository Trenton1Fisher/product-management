import { Component, Input } from "@angular/core";
import { SupabaseService } from "../../supabase.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CommonModule } from "@angular/common";
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: 'product-image',
  standalone: true,
  templateUrl: './productImage.component.html',
  styleUrls: ['./productImage.component.css'],
  imports: [CommonModule, MatProgressSpinnerModule],
})
export class ProductImage {
  _productImageUrl: SafeResourceUrl | undefined
  loading = false

  @Input() url = ''

  ngOnChanges(): void{
    if(this.url){
      this.downloadImage(this.url)
    }
  }

  constructor(
    private readonly supabase: SupabaseService,
    private readonly dom: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ){}

  async downloadImage(path: string){
    this.loading = true
    try{
      const {data , error} = await this.supabase.getImage(path)
      if(data instanceof Blob){
        this._productImageUrl = this.dom.bypassSecurityTrustUrl(URL.createObjectURL(data))
      }
      if(error){
        console.log(error.message)
      }
    }catch(error){
      console.log(error)
    }
    this.loading = false
    this.cdr.detectChanges()
  }
}
