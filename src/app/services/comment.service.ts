import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CommentRequest } from '../models/comment.model';
import { MessageResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private baseUrl = 'http://3.110.61.209.nip.io:8080/api/comments';
  
  constructor(private http: HttpClient) {}
  
  getCommentsByCard(cardId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/card/${cardId}`);
  }
  
  addComment(data: CommentRequest): Observable<Comment> {
    return this.http.post<Comment>(this.baseUrl, data);
  }
  
  updateComment(id: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseUrl}/${id}`, { content });
  }
  
  deleteComment(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${id}`);
  }
}
