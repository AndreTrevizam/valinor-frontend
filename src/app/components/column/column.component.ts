import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColumnService } from '../../services/column.service';
import { Column } from '../../models/column.model';
import { TaskService } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-column',
  imports: [FormsModule],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css'
})
export class ColumnComponent implements OnInit, OnDestroy {
  constructor(
    private columnService: ColumnService,
    private taskService: TaskService,
  ) {}

  private destroy$ = new Subject<void>();

  isCreatingColumn = false;
  isAddingTask = false;
  editedColumnName = ''
  editedTaskName = ''
  newTaskName = '';
  newColumnName = '';
  columns: Column[] = [];
  addingTaskToColumnId: string | null = null;
  isLoading = false;
  error: string | null = null;
  editingColumnId: string | null = null;
  editingTaskId: string | null = null

  startEditingColumn(column: Column) {
    this.editingColumnId = column.id;
    this.editedColumnName = column.name;
  }
  
  cancelEditingColumn() {
    this.editingColumnId = null;
    this.editedColumnName = '';
  }

  startEditingTask(task: Task) {
    this.editingTaskId = task.id;
    this.editedTaskName = task.name;
  }
  
  cancelEditingTask() {
    this.editingTaskId = null;
    this.editedTaskName = '';
  }

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
      
      await this.columnService.loadColumnsWithTasks();

      this.newTaskName = '';
      this.cancelAddingTask();
    } catch (error) {
      console.error('Error adding task:', error);
      this.error = 'Falha ao adicionar tarefa';
    } finally {
      this.isLoading = false;
    }
  }

  async deleteTask(taskId: string) {
    try {
      this.isLoading = true;
      await this.taskService.deleteTask(taskId);

      await this.columnService.loadColumnsWithTasks();

      this.isLoading = false;

    } catch (error) {
      console.error('Error deleting task:', error);
      throw error
    }
  }

  async deleteColumn(columnId: string) {
    try {
      this.isLoading = true;
      await this.columnService.deleteColumn(columnId);

      await this.columnService.loadColumnsWithTasks();

      this.isLoading = false;

    } catch (error) {
      console.error('Error deleting column:', error);
      throw error
    }
  }

  async saveColumnName(columnId: string) {
    if (!this.editedColumnName.trim()) return

    try {
      this.isLoading = true

      await this.columnService.updateColumnName(
        columnId,
        { name: this.editedColumnName }
      )
      
      this.cancelEditingColumn()

      await this.columnService.loadColumnsWithTasks()


    } catch (error) {
      console.log('Error saving column name', error)
      throw error
    }
  }

  async saveTaskName(taskId: string, columnId: string) {
    if (!this.editedTaskName.trim()) return

    try {
      this.isLoading = true

      await this.taskService.updateTaskName(
        taskId,
        { name: this.editedTaskName, columnId: columnId }
      )

      this.cancelEditingTask()

      await this.columnService.loadColumnsWithTasks()

    } catch (error) {
      console.log('Error saving task name', error)
      throw error
    }
  }
}