export interface Label {
  id: number;
  boardId: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface LabelRequest {
  name: string;
  color?: string;
}
