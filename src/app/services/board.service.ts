import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board, BoardRequest, BoardMember } from '../models/board.model';
import { MessageResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private baseUrl = 'http://16.176.51.5:8080/api/v1/boards';

  constructor(private http: HttpClient) { }

  getBoardsByWorkspace(workspaceId: number): Observable<Board[]> {
    return this.http.get<Board[]>(`${this.baseUrl}/workspace/${workspaceId}`);
  }

  getBoardById(id: number): Observable<Board> {
    return this.http.get<Board>(`${this.baseUrl}/${id}`);
  }

  createBoard(data: BoardRequest): Observable<Board> {
    return this.http.post<Board>(this.baseUrl, data);
  }

  updateBoard(id: number, data: BoardRequest): Observable<Board> {
    return this.http.put<Board>(`${this.baseUrl}/${id}`, data);
  }

  deleteBoard(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${id}`);
  }

  getBoardMembers(boardId: number): Observable<BoardMember[]> {
    return this.http.get<BoardMember[]>(`${this.baseUrl}/${boardId}/members`);
  }
}
