import { EmailServicePort } from '../../../domain/ports/email-service.port';

export class ConsoleEmailAdapter implements EmailServicePort {
  public async sendUserInvitation(email: string, name: string, temporaryPassword: string): Promise<void> {
    console.log('\n==================================================');
    console.log('📬 SIMULATED INVITATION EMAIL');
    console.log(`To: ${name} <${email}>`);
    console.log('Subject: Welcome to Bet Control App - Invitation');
    console.log('--------------------------------------------------');
    console.log(`Hello ${name},`);
    console.log('You have been invited to the Bet Control App.');
    console.log('\nHere are your temporary login credentials:');
    console.log(`- Email: ${email}`);
    console.log(`- Temporary Password: ${temporaryPassword}`);
    console.log('\nPlease click the link below to sign in:');
    console.log('👉 http://localhost:3000/login');
    console.log('\nNote: You will be required to change your password upon your first sign in.');
    console.log('==================================================\n');
  }
}
