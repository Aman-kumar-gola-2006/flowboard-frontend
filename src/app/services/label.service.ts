import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Label, LabelRequest } from '../models/label.model';
import { MessageResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class LabelService {
  private baseUrl = 'http://16.176.51.5:8080/api/v1/labels';
  
  constructor(private http: HttpClient) {}
  
  getBoardLabels(boardId: number): Observable<Label[]> {
    return this.http.get<Label[]>(`${this.baseUrl}/board/${boardId}`);
  }
  
  createLabel(boardId: number, data: LabelRequest): Observable<Label> {
    return this.http.post<Label>(`${this.baseUrl}/board/${boardId}`, data);
  }
  
  updateLabel(id: number, data: LabelRequest): Observable<Label> {
    return this.http.put<Label>(`${this.baseUrl}/${id}`, data);
  }
  
  deleteLabel(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${id}`);
  }
  
  getCardLabels(cardId: number, boardId: number): Observable<Label[]> {
    return this.http.get<Label[]>(`${this.baseUrl}/card/${cardId}`, {
      params: { boardId: boardId.toString() }
    });
  }
  
  addLabelToCard(cardId: number, labelId: number, boardId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/card/${cardId}/add/${labelId}`, {}, {
      params: { boardId: boardId.toString() }
    });
  }
  
  removeLabelFromCard(cardId: number, labelId: number, boardId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/card/${cardId}/remove/${labelId}`, {
      params: { boardId: boardId.toString() }
    });
  }
}
