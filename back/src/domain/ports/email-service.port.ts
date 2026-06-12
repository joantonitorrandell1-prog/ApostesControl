export interface EmailServicePort {
  sendUserInvitation(email: string, name: string, temporaryPassword: string): Promise<void>;
}
