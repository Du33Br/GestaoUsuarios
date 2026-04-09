import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  form!: FormGroup;
  editId: number | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      perfil: ['usuario', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = +id;
      this.isEditMode = true;
      const user = this.userService.getUserById(this.editId);
      if (user) {
        this.form.patchValue(user);
      }
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const value = this.form.value;
    if (this.isEditMode && this.editId !== null) {
      this.userService.updateUser(this.editId, value);
    } else {
      this.userService.createUser(value);
    }
    this.router.navigate(['/users']);
  }
}
