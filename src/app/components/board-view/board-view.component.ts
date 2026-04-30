import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { NavbarComponent } from '../navbar/navbar.component';
import { CardDetailComponent } from '../card-detail/card-detail.component';
import { BoardService } from '../../services/board.service';
import { ListService } from '../../services/list.service';
import { CardService } from '../../services/card.service';
import { AuthService } from '../../services/auth.service';
import { Board } from '../../models/board.model';
import { TaskList } from '../../models/list.model';
import { Card, CardRequest } from '../../models/card.model';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';

import { BoardAnalyticsComponent } from '../board-analytics/board-analytics.component';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-board-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule, NavbarComponent, CardDetailComponent, BoardAnalyticsComponent],
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.css']
})
export class BoardViewComponent implements OnInit, OnDestroy {
  @ViewChild('analytics') analyticsComponent!: BoardAnalyticsComponent;
  
  boardId!: number;
  board: Board | null = null;
  lists: TaskList[] = [];
  cards: { [listId: number]: Card[] } = {};

  isLoading = true;
  errorMessage = '';

  // New list
  showAddList = false;
  newListName = '';
  newListColor = '#dddddd';
  isCreatingList = false;

  // New card
  activeAddCardListId: number | null = null;
  newCardTitle = '';
  isCreatingCard = false;

  // Card detail modal
  selectedCard: Card | null = null;
  showCardModal = false;

  private destroy$ = new Subject<void>();

  // Getter for connected drop lists
  get connectedListIds(): string[] {
    return this.lists.map(list => 'list-' + list.id);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private boardService: BoardService,
    private listService: ListService,
    private cardService: CardService,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.boardId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBoard();
    this.loadLists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBoard(): void {
    this.boardService.getBoardById(this.boardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (board) => {
          this.board = board;
        },
        error: (err) => {
          console.error('Board load error:', err);
          this.errorMessage = 'Failed to load board';
        }
      });
  }

  loadLists(): void {
    this.isLoading = true;
    this.listService.getListsByBoard(this.boardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lists) => {
          this.lists = lists;
          this.loadCardsForAllLists();
        },
        error: (err) => {
          console.error('Lists load error:', err);
          this.errorMessage = 'Failed to load lists';
          this.isLoading = false;
        }
      });
  }

  loadCardsForAllLists(): void {
    if (this.lists.length === 0) {
      this.isLoading = false;
      return;
    }

    let loadedCount = 0;
    this.lists.forEach(list => {
      this.cardService.getCardsByList(list.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (cards) => {
            this.cards[list.id] = cards;
            loadedCount++;
            if (loadedCount === this.lists.length) {
              this.isLoading = false;
            }
          },
          error: (err) => {
            console.error('Cards load error:', err);
            this.cards[list.id] = [];
            loadedCount++;
            if (loadedCount === this.lists.length) {
              this.isLoading = false;
            }
          }
        });
    });
  }

  // ========== LIST OPERATIONS ==========

  startAddList(): void {
    this.showAddList = true;
    this.newListName = '';
  }

  cancelAddList(): void {
    this.showAddList = false;
    this.newListName = '';
    this.newListColor = '#dddddd';
  }

  createList(): void {
    if (!this.newListName.trim()) return;

    this.isCreatingList = true;
    this.listService.createList({
      boardId: this.boardId,
      name: this.newListName.trim(),
      color: this.newListColor
    }).subscribe({
      next: (list) => {
        this.lists.push(list);
        this.cards[list.id] = [];
        this.isCreatingList = false;
        this.cancelAddList();
      },
      error: (err) => {
        console.error('Create list error:', err);
        this.isCreatingList = false;
      }
    });
  }

  deleteList(list: TaskList): void {
    this.confirmService.confirm({
      title: 'Delete List?',
      message: `Are you sure you want to delete the list "${list.name}"? All cards inside this list will also be permanently deleted.`,
      confirmText: 'Delete List',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.listService.deleteList(list.id).subscribe({
          next: () => {
            this.lists = this.lists.filter(l => l.id !== list.id);
            delete this.cards[list.id];
            this.toastService.success('List Deleted', 'The list and its cards have been removed.');
            this.analyticsComponent?.loadData();
          },
          error: (err) => this.toastService.error('Error', 'Failed to delete list')
        });
      }
    });
  }

  // ========== CARD OPERATIONS ==========

  startAddCard(listId: number): void {
    this.activeAddCardListId = listId;
    this.newCardTitle = '';
  }

  cancelAddCard(): void {
    this.activeAddCardListId = null;
    this.newCardTitle = '';
  }

  createCard(listId: number): void {
    if (!this.newCardTitle.trim()) return;

    this.isCreatingCard = true;
    const cardRequest: CardRequest = {
      listId: listId,
      boardId: this.boardId,
      title: this.newCardTitle.trim()
    };

    this.cardService.createCard(cardRequest).subscribe({
      next: (card) => {
        if (!this.cards[listId]) this.cards[listId] = [];
        this.cards[listId].push(card);
        this.isCreatingCard = false;
        this.cancelAddCard();
      },
      error: (err) => {
        console.error('Create card error:', err);
        this.isCreatingCard = false;
      }
    });
  }

  // ========== DRAG & DROP ==========

  drop(event: CdkDragDrop<Card[]>, targetListId: number): void {
    const card = event.item.data as Card;
    if (!card) return;

    // Auto-update status based on list name
    const targetList = this.lists.find(l => l.id === targetListId);
    if (targetList) {
      const name = targetList.name.toLowerCase();
      let newStatus: string | null = null;
      
      if (name.includes('done')) newStatus = 'DONE';
      else if (name.includes('progress')) newStatus = 'IN_PROGRESS';
      else if (name.includes('review')) newStatus = 'IN_REVIEW';
      else if (name.includes('to do') || name.includes('todo')) newStatus = 'TO_DO';

      if (newStatus && card.status !== newStatus) {
        card.status = newStatus as any;
        this.cardService.updateCard(card.id, { status: newStatus as any }).subscribe({
          next: () => this.analyticsComponent?.loadData()
        });
      }
    }

    if (event.previousContainer === event.container) {
      // Same list - reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      card.listId = targetListId;
      this.updateCardPosition(card.id, targetListId, event.currentIndex);
    } else {
      // Different list - move
      const originalListId = card.listId;
      const originalIndex = event.previousIndex;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const movedCard = event.container.data[event.currentIndex] as Card;
      movedCard.listId = targetListId;

      this.moveCardToList(card.id, targetListId, event.currentIndex, originalListId, originalIndex);
    }
  }

  updateCardPosition(cardId: number, listId: number, newPosition: number): void {
    this.cardService.moveCard(cardId, {
      targetListId: listId,
      newPosition: newPosition
    }).subscribe({
      error: (err) => {
        console.error('Reorder error:', err);
        this.loadLists();
      }
    });
  }

  moveCardToList(
    cardId: number,
    targetListId: number,
    newPosition: number,
    originalListId: number,
    originalIndex: number
  ): void {
    this.cardService.moveCard(cardId, {
      targetListId: targetListId,
      newPosition: newPosition
    }).subscribe({
      error: (err) => {
        console.error('Move error:', err);
        this.revertCardToOriginalPosition(cardId, originalListId, originalIndex);
      }
    });
  }

  private revertCardToOriginalPosition(
    cardId: number,
    originalListId: number,
    originalIndex: number
  ): void {
    let currentListId: number | null = null;
    let currentIndex = -1;

    for (const listId of Object.keys(this.cards)) {
      const listCards = this.cards[Number(listId)];
      const idx = listCards.findIndex(c => c.id === cardId);
      if (idx !== -1) {
        currentListId = Number(listId);
        currentIndex = idx;
        break;
      }
    }

    if (currentListId === null) return;

    const [card] = this.cards[currentListId].splice(currentIndex, 1);
    this.cards[originalListId].splice(originalIndex, 0, card);
  }

  // ========== CARD DETAIL ==========

  openCardDetail(card: Card): void {
    this.selectedCard = card;
    this.showCardModal = true;
  }

  closeCardModal(): void {
    this.selectedCard = null;
    this.showCardModal = false;
  }

  handleCardUpdate(updatedCard: Card): void {
    const listCards = this.cards[updatedCard.listId];
    if (listCards) {
      const index = listCards.findIndex(c => c.id === updatedCard.id);
      if (index !== -1) {
        listCards[index] = updatedCard;
        this.analyticsComponent?.loadData();
      }
    }
  }

  handleCardDelete(cardId: number): void {
    for (const listId in this.cards) {
      this.cards[listId] = this.cards[listId].filter(c => c.id !== cardId);
    }
    this.analyticsComponent?.loadData();
    this.closeCardModal();
  }

  // ========== UTILS ==========

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'LOW': 'bg-green-100 text-green-700',
      'MEDIUM': 'bg-yellow-100 text-yellow-700',
      'HIGH': 'bg-orange-100 text-orange-700',
      'CRITICAL': 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'TO_DO': 'bg-gray-100 text-gray-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'IN_REVIEW': 'bg-purple-100 text-purple-700',
      'DONE': 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }

  isOverdue(dueDate: string, status: string): boolean {
    if (status === 'DONE') return false;
    return new Date(dueDate) < new Date();
  }

  isDarkColor(hex: string): boolean {
    if (!hex || hex === '#dddddd') return false;
    const color = hex.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }

  goBack(): void {
    this.router.navigate(['/workspace', this.board?.workspaceId]);
  }
}
