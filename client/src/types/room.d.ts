
export interface RoomResponse {
  roomId: string;
  name: string;
  inviteCode: string;
  inviteLink: string;
}

export interface CreateRoomProps {
  onRoomCreated?: (room: RoomResponse) => void;
}