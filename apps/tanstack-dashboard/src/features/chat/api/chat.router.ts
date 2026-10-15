import {
  chatImpl,
  createGroupProcedure,
  createRoomProcedure,
  deleteGroupProcedure,
  listConversationProcedure,
  listMessagesProcedure,
  roomDetailsProcedure,
  setRoomMutedProcedure,
  updateGroupProcedure,
} from "./chat.procedure";

export const chatRouter = chatImpl.router({
  listConversation: listConversationProcedure,
  createRoom: createRoomProcedure,
  createGroup: createGroupProcedure,
  updateGroup: updateGroupProcedure,
  deleteGroup: deleteGroupProcedure,
  setRoomMuted: setRoomMutedProcedure,
  roomDetails: roomDetailsProcedure,
  listMessages: listMessagesProcedure,
});
