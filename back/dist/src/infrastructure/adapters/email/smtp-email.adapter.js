"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpEmailAdapter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class SmtpEmailAdapter {
    transporter;
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        });
    }
    async sendUserInvitation(email, name, temporaryPassword) {
        const fromName = process.env.SMTP_FROM_NAME || 'Apostes Control';
        const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@apostescontrol.com';
        await this.transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: 'Benvingut a ApostesControl - Invitació',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0b1121; border-radius: 16px; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">
              APOSTES<span style="color: #10b981;">CONTROL</span>
            </h1>
          </div>

          <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px;">Benvingut/da, ${name}!</h2>

          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Has estat convidat/da a la plataforma <strong style="color: #e2e8f0;">ApostesControl</strong>.
            A continuació tens les teves credencials temporals per accedir-hi per primera vegada.
          </p>

          <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <div style="margin-bottom: 12px;">
              <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Correu electrònic</p>
              <p style="color: #e2e8f0; font-size: 14px; font-weight: 600; margin: 0;">${email}</p>
            </div>
            <div>
              <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Contrasenya temporal</p>
              <p style="color: #10b981; font-size: 16px; font-weight: 700; font-family: monospace; margin: 0;">${temporaryPassword}</p>
            </div>
          </div>

          <a href="http://localhost:3000/login" style="display: block; text-align: center; background-color: #10b981; color: #0b1121; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; margin: 20px 0;">
            Iniciar sessió
          </a>

          <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
            ⚠️ <strong style="color: #f59e0b;">Important:</strong> Se't demanarà que canvïis la contrasenya en el primer inici de sessió.
            Si no has sol·licitat aquest compte, ignora aquest missatge.
          </p>

          <hr style="border: none; border-top: 1px solid #1e293b; margin: 20px 0;" />

          <p style="color: #475569; font-size: 11px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} ApostesControl · Tots els drets reservats
          </p>
        </div>
      `,
        });
        console.log(`📧 Invitation email sent to ${name} <${email}>`);
    }
}
exports.SmtpEmailAdapter = SmtpEmailAdapter;
