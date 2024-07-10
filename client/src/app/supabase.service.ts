import { Injectable } from '@angular/core';

import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export interface Profile {
  id?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  _session: AuthSession | null = null;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session;
    });
    return this._session;
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  addImage(imgPath: string, file: File){
    return this.supabase.storage.from('product-management/products').upload(imgPath, file)
  }

  getImage(imgPath: string){
    return this.supabase.storage.from('product-management/products').download(imgPath)
  }

  deleteImage(imgPath: string){
    return this.supabase.storage.from(`product-management/products/${imgPath}`).remove([`/${imgPath}`])
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }
  signOut() {
    return this.supabase.auth.signOut();
  }
}
