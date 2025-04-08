import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../utils/enviroment';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`

  async createTask(columnId: string, taskData: { name: string }): Promise<Task> {
    try {
      const response = await axios.post<Task>(`${this.apiUrl}`, {
        ...taskData,
        columnId
      });

      return response.data;

    } catch (error) {
      console.log('Error creating task:', error);
      throw error;
    }
  }

  async getTasksByColumn(columnId: string): Promise<Task[]> {
    try {
      const response = await axios.get<Task[]>(`${environment.apiUrl}/tasks/${columnId}`);
      return response.data;
    } catch (error) {
      console.error(`Error loading tasks for column ${columnId}:`, error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/${taskId}`);
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  }

  async updateTaskName(taskId: string, updatedData: { name: string, columnId: string }): Promise<Task> {
    try {
      const response = await axios.put<Task>(`${this.apiUrl}/${taskId}`, updatedData)

      return response.data

    } catch (error) {
      console.log('Error updating name task', error)
      throw error   
    }
  }

  constructor() { }
}
