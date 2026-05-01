import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskList, ListRequest, ReorderRequest } from '../models/list.model';
import { MessageResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ListService {
  private baseUrl = 'https://16.176.51.5/api/v1/lists';
  
  constructor(private http: HttpClient) {}
  
  getListsByBoard(boardId: number, includeArchived: boolean = false): Observable<TaskList[]> {
    return this.http.get<TaskList[]>(`${this.baseUrl}/board/${boardId}`, {
      params: { includeArchived: includeArchived.toString() }
    });
  }
  
  getListById(id: number): Observable<TaskList> {
    return this.http.get<TaskList>(`${this.baseUrl}/${id}`);
  }
  
  createList(data: ListRequest): Observable<TaskList> {
    return this.http.post<TaskList>(this.baseUrl, data);
  }
  
  updateList(id: number, data: ListRequest): Observable<TaskList> {
    return this.http.put<TaskList>(`${this.baseUrl}/${id}`, data);
  }
  
  reorderLists(boardId: number, listIds: number[]): Observable<TaskList[]> {
    return this.http.put<TaskList[]>(`${this.baseUrl}/board/${boardId}/reorder`, { listIds });
  }
  
  archiveList(id: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}/${id}/archive`, {});
  }
  
  unarchiveList(id: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}/${id}/unarchive`, {});
  }
  
  deleteList(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${id}`);
  }
}
