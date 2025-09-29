import { GameService } from '../services/GameService';

export class LobbyFinderScene extends Phaser.Scene {
  private gameService: GameService;
  private statusText?: Phaser.GameObjects.Text;
  private roomListContainer?: Phaser.GameObjects.Container;
  private refreshButton?: Phaser.GameObjects.Rectangle;
  private roomNameInput?: HTMLInputElement;
  private showingCreateDialog: boolean = false;

  constructor() {
    super({ key: 'LobbyFinderScene' });
    this.gameService = GameService.getInstance();
  }

  create() {
    console.log('LobbyFinderScene created');
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, 60, 'Game Lobbies', {
      fontSize: '32px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Status text
    this.statusText = this.add.text(width / 2, 100, 'Loading rooms...', {
      fontSize: '16px',
      color: '#bdc3c7'
    }).setOrigin(0.5);

    // Room list container
    this.roomListContainer = this.add.container(width / 2, 200);

    // Create Game button
    const createButton = this.add.rectangle(width / 2 - 120, height - 80, 200, 50, 0x3498db);
    createButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2 - 120, height - 80, 'CREATE GAME', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Refresh button
    this.refreshButton = this.add.rectangle(width / 2 + 120, height - 80, 150, 50, 0x27ae60);
    this.refreshButton.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2 + 120, height - 80, 'REFRESH', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Back button
    const backButton = this.add.rectangle(50, height - 40, 80, 30, 0x95a5a6);
    backButton.setInteractive({ useHandCursor: true });
    
    this.add.text(50, height - 40, 'BACK', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Button interactions
    createButton.on('pointerup', () => {
      this.showCreateDialog();
    });

    this.refreshButton.on('pointerup', () => {
      this.refreshRoomList();
    });

    backButton.on('pointerup', () => {
      this.scene.start('StartScene');
    });

    // Hover effects
    createButton.on('pointerover', () => createButton.setFillStyle(0x5dade2));
    createButton.on('pointerout', () => createButton.setFillStyle(0x3498db));
    
    this.refreshButton.on('pointerover', () => this.refreshButton!.setFillStyle(0x2ecc71));
    this.refreshButton.on('pointerout', () => this.refreshButton!.setFillStyle(0x27ae60));
    
    backButton.on('pointerover', () => backButton.setFillStyle(0xa4b0b0));
    backButton.on('pointerout', () => backButton.setFillStyle(0x95a5a6));

    // Load initial room list
    this.refreshRoomList();
  }

  private showCreateDialog() {
    if (this.showingCreateDialog) return;
    this.showingCreateDialog = true;

    const { width, height } = this.cameras.main;

    // Dialog background
    const dialogBg = this.add.rectangle(width / 2, height / 2, 400, 250, 0x2c3e50);
    dialogBg.setStrokeStyle(2, 0x3498db);

    // Dialog title
    this.add.text(width / 2, height / 2 - 80, 'Create New Lobby', {
      fontSize: '24px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Room name label
    this.add.text(width / 2, height / 2 - 40, 'Lobby Name (optional):', {
      fontSize: '16px',
      color: '#bdc3c7'
    }).setOrigin(0.5);

    // Room name input background
    const inputBg = this.add.rectangle(width / 2, height / 2, 300, 40, 0x34495e);
    inputBg.setStrokeStyle(1, 0x3498db);

    // Create HTML input element
    this.roomNameInput = document.createElement('input');
    this.roomNameInput.type = 'text';
    this.roomNameInput.placeholder = 'Enter lobby name...';
    this.roomNameInput.maxLength = 30;
    this.roomNameInput.style.position = 'absolute';
    this.roomNameInput.style.left = (width / 2 - 150) + 'px';
    this.roomNameInput.style.top = (height / 2 - 20) + 'px';
    this.roomNameInput.style.width = '300px';
    this.roomNameInput.style.height = '40px';
    this.roomNameInput.style.fontSize = '16px';
    this.roomNameInput.style.textAlign = 'center';
    this.roomNameInput.style.border = 'none';
    this.roomNameInput.style.borderRadius = '5px';
    this.roomNameInput.style.backgroundColor = '#34495e';
    this.roomNameInput.style.color = '#ecf0f1';
    this.roomNameInput.style.outline = 'none';
    this.roomNameInput.style.zIndex = '1000';

    document.body.appendChild(this.roomNameInput);
    this.roomNameInput.focus();

    // Create button
    const createBtn = this.add.rectangle(width / 2 - 70, height / 2 + 60, 120, 40, 0x27ae60);
    createBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2 - 70, height / 2 + 60, 'CREATE', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Cancel button
    const cancelBtn = this.add.rectangle(width / 2 + 70, height / 2 + 60, 120, 40, 0x95a5a6);
    cancelBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2 + 70, height / 2 + 60, 'CANCEL', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Store dialog elements for cleanup
    const dialogElements = [dialogBg, createBtn, cancelBtn];

    // Button interactions
    createBtn.on('pointerup', () => {
      this.createRoom();
      this.cleanupCreateDialog(dialogElements);
    });

    cancelBtn.on('pointerup', () => {
      this.cleanupCreateDialog(dialogElements);
    });

    // Handle Enter key
    this.roomNameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.createRoom();
        this.cleanupCreateDialog(dialogElements);
      } else if (event.key === 'Escape') {
        this.cleanupCreateDialog(dialogElements);
      }
    });

    // Hover effects
    createBtn.on('pointerover', () => createBtn.setFillStyle(0x2ecc71));
    createBtn.on('pointerout', () => createBtn.setFillStyle(0x27ae60));
    
    cancelBtn.on('pointerover', () => cancelBtn.setFillStyle(0xa4b0b0));
    cancelBtn.on('pointerout', () => cancelBtn.setFillStyle(0x95a5a6));
  }

  private cleanupCreateDialog(dialogElements: Phaser.GameObjects.GameObject[]) {
    // Clean up HTML input
    if (this.roomNameInput && document.body.contains(this.roomNameInput)) {
      document.body.removeChild(this.roomNameInput);
      this.roomNameInput = undefined;
    }

    // Clean up dialog elements
    dialogElements.forEach(element => element.destroy());
    
    this.showingCreateDialog = false;
  }

  private async createRoom() {
    const roomName = this.roomNameInput?.value?.trim() || '';
    this.statusText!.setText('Creating new room...');
    try {
      await this.gameService.connect();
      await this.gameService.createRoom(roomName);
      this.scene.start('ReadyScene');
    } catch (error) {
      console.error('Failed to create room:', error);
      this.statusText!.setText('Failed to create room. Try again?');
    }
  }

  async refreshRoomList() {
    try {
      this.statusText!.setText('Refreshing room list...');
      await this.gameService.connect();
      const rooms = await this.gameService.listRooms();
      this.displayRooms(rooms);
      
      if (rooms.length === 0) {
        this.statusText!.setText('No active rooms found. Create one to start playing!');
      } else {
        this.statusText!.setText(`Found ${rooms.length} room${rooms.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Failed to refresh room list:', error);
      this.statusText!.setText('Failed to load rooms. Check server connection.');
    }
  }

  displayRooms(rooms: any[]) {
    // Clear existing room list
    this.roomListContainer!.removeAll(true);

    const maxRoomsToShow = 6;
    const roomsToShow = rooms.slice(0, maxRoomsToShow);
    
    roomsToShow.forEach((room, index) => {
      const y = index * 60;
      
      // Room background
      const roomBg = this.add.rectangle(0, y, 400, 50, 0x34495e);
      roomBg.setInteractive({ useHandCursor: true });
      
      // Room info text - show room name if available, otherwise fallback to room ID
      const displayName = room.metadata?.roomName || `Room ${room.roomId.substring(0, 8)}...`;
      const roomText = this.add.text(-180, y - 10, 
        displayName, {
          fontSize: '16px',
          color: '#ecf0f1'
        }).setOrigin(0, 0.5);
      
      const statusText = this.add.text(-180, y + 8,
        `${room.playerCount}/${room.maxPlayers} players • ${room.gameState}`, {
          fontSize: '12px',
          color: '#bdc3c7'
        }).setOrigin(0, 0.5);
      
      // Join button
      const joinBtn = this.add.rectangle(150, y, 80, 35, 
        room.playerCount >= room.maxPlayers ? 0x95a5a6 : 0xe67e22);
      joinBtn.setInteractive({ 
        useHandCursor: room.playerCount < room.maxPlayers 
      });
      
      this.add.text(150, y, 
        room.playerCount >= room.maxPlayers ? 'FULL' : 'JOIN', {
          fontSize: '12px',
          color: '#ffffff'
        }).setOrigin(0.5);

      // Add to container
      this.roomListContainer!.add([roomBg, roomText, statusText, joinBtn]);
      
      // Join room functionality
      if (room.playerCount < room.maxPlayers) {
        roomBg.on('pointerup', () => this.joinRoom(room.roomId));
        joinBtn.on('pointerup', () => this.joinRoom(room.roomId));
        
        // Hover effects
        roomBg.on('pointerover', () => roomBg.setFillStyle(0x4a5f7a));
        roomBg.on('pointerout', () => roomBg.setFillStyle(0x34495e));
      }
    });
  }

  async joinRoom(roomId: string) {
    this.statusText!.setText('Joining room...');
    try {
      await this.gameService.joinRoom(roomId);
      this.scene.start('ReadyScene');
    } catch (error) {
      console.error('Failed to join room:', error);
      this.statusText!.setText('Failed to join room. It may be full or no longer exist.');
      // Refresh the room list after a failed join
      setTimeout(() => this.refreshRoomList(), 2000);
    }
  }

  cleanup() {
    // Clean up HTML input if scene is destroyed
    if (this.roomNameInput && document.body.contains(this.roomNameInput)) {
      document.body.removeChild(this.roomNameInput);
      this.roomNameInput = undefined;
    }
  }
}