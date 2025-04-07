import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColumnService } from '../../services/column.service';
import { Column } from '../../models/column.model';
import { TaskService } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-column',
  imports: [FormsModule],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css'
})
export class ColumnComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isCreatingColumn = false;
  isAddingTask = false;
  newTaskName = '';
  newColumnName = '';
  columns: Column[] = [];
  addingTaskToColumnId: string | null = null;
  isLoading = false;
  error: string | null = null;

  startCreatingColumn() {
    this.isCreatingColumn = true;
  }

  startAddingTask(columnId: string) {
    this.addingTaskToColumnId = columnId;
    this.isAddingTask = true;
  }

  cancelAddingTask() {
    this.addingTaskToColumnId = null;
    this.newTaskName = '';
    this.isAddingTask = false;
  }

  cancelCreatingColumn() {
    this.isCreatingColumn = false;
    this.newColumnName = '';
  }

  constructor(
    private columnService: ColumnService,
    private taskService: TaskService,
  ) {}

  async ngOnInit() {
    this.setupColumnsSubscription();
    await this.loadColumnsWithTasks();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupColumnsSubscription() {
    this.columnService.columns$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (columns) => this.columns = columns,
        error: (err) => this.error = 'Falha ao carregar colunas'
      });
  }

  async loadColumnsWithTasks() {
    this.isLoading = true;
    this.error = null;
    
    try {
      await this.columnService.loadColumnsWithTasks();
    } catch (error) {
      console.error('Error loading columns with tasks:', error);
      this.error = 'Falha ao carregar tarefas';
    } finally {
      this.isLoading = false;
    }
  }
  
  async addTask(event: Event, columnId: string) {
    event.preventDefault();
  
    if (!this.newTaskName.trim()) return;
  
    try {
      this.isLoading = true;
      await this.taskService.createTask(columnId, {
        name: this.newTaskName,
      });
      
      // Remove a manipulação manual do estado
      this.newTaskName = '';
      this.cancelAddingTask();
    } catch (error) {
      console.error('Error adding task:', error);
      this.error = 'Falha ao adicionar tarefa';
    } finally {
      this.isLoading = false;
    }
  }

  // ... outros métodos permanecem inalterados
}