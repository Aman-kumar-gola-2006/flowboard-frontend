import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, CardRequest, MoveCardRequest } from '../models/card.model';
import { MessageResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private baseUrl = '/api/cards';
  
  constructor(private http: HttpClient) {}
  
  getCardsByList(listId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/list/${listId}`);
  }
  
  getCardsByBoard(boardId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/board/${boardId}`);
  }
  
  getCardById(id: number): Observable<Card> {
    return this.http.get<Card>(`${this.baseUrl}/${id}`);
  }
  
  createCard(data: CardRequest): Observable<Card> {
    return this.http.post<Card>(this.baseUrl, data);
  }
  
  updateCard(id: number, data: Partial<CardRequest>): Observable<Card> {
    return this.http.put<Card>(`${this.baseUrl}/${id}`, data);
  }
  
  moveCard(id: number, data: MoveCardRequest): Observable<Card[]> {
    return this.http.put<Card[]>(`${this.baseUrl}/${id}/move`, data);
  }
  
  archiveCard(id: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}/${id}/archive`, {});
  }
  
  deleteCard(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${id}`);
  }
  
  getCardsByAssignee(userId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/assignee/${userId}`);
  }
  
  getOverdueCards(boardId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/board/${boardId}/overdue`);
  }
}
