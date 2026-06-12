"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const drizzle_1 = require("better-auth/adapters/drizzle");
const connection_1 = require("../adapters/db/drizzle/connection");
const schema = __importStar(require("../adapters/db/drizzle/schema"));
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, drizzle_1.drizzleAdapter)(connection_1.db, {
        provider: 'pg',
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    trustedOrigins: [
        process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    emailAndPassword: {
        enabled: true,
        autoSignIn: false, // Don't auto login after creation (so user logs in explicitly)
        requireEmailVerification: false, // Allow login even if email is not verified
    },
    // Define custom fields that we added to our database
    user: {
        additionalFields: {
            role: {
                type: 'string',
                defaultValue: 'USER',
            },
            requirePasswordChange: {
                type: 'boolean',
                defaultValue: false,
            },
        },
    },
});
