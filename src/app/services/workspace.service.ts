import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workspace, WorkspaceRequest, WorkspaceMember, AddMemberRequest } from '../models/workspace.model';
import { MessageResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private baseUrl = 'https://16.176.51.5/api/v1/workspaces';
  
  constructor(private http: HttpClient) {}
  
  getUserWorkspaces(userId: number): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.baseUrl}/user/${userId}`);
  }
  
  getWorkspaceById(id: number): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.baseUrl}/${id}`);
  }
  
  createWorkspace(data: WorkspaceRequest): Observable<Workspace> {
    return this.http.post<Workspace>(this.baseUrl, data);
  }
  
  updateWorkspace(id: number, data: WorkspaceRequest): Observable<Workspace> {
    return this.http.put<Workspace>(`${this.baseUrl}/${id}`, data);
  }
  
  deleteWorkspace(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${id}`);
  }
  
  getMembers(workspaceId: number): Observable<WorkspaceMember[]> {
    return this.http.get<WorkspaceMember[]>(`${this.baseUrl}/${workspaceId}/members`);
  }
  
  addMember(workspaceId: number, data: AddMemberRequest): Observable<WorkspaceMember> {
    return this.http.post<WorkspaceMember>(`${this.baseUrl}/${workspaceId}/members`, data);
  }
  
  removeMember(workspaceId: number, userId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${workspaceId}/members/${userId}`);
  }

  getPendingInvitations(userId: number): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.baseUrl}/member/${userId}/pending`);
  }

  acceptInvitation(workspaceId: number, userId: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/${workspaceId}/members/${userId}/accept`, {});
  }

  rejectInvitation(workspaceId: number, userId: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/${workspaceId}/members/${userId}/reject`, {});
  }

  validateInvitation(token: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/invitations/validate?token=${token}`);
  }

  acceptInvitationByToken(token: string, userId: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/invitations/accept?token=${token}&userId=${userId}`, {});
  }
}
