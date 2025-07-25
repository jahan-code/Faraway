import {
    adminLoginSchema,
    adminForgotPasswordSchema,
    adminVerifyOtpSchema,
    adminResetPasswordSchema,
    adminResendOtpSchema,
} from './auth.validation.js';
import { addyachtSchema, deleteYachtSchema, getAllYachtsSchema, getYachtByIdSchema } from './yacht.validation.js';
const validationSchemas = {
    // Authentication
    '/auth/admin/login': { POST: adminLoginSchema },
    '/auth/admin/forgot-password': { POST: adminForgotPasswordSchema },
    '/auth/admin/verify-otp': { POST: adminVerifyOtpSchema },
    '/auth/admin/reset-password': { POST: adminResetPasswordSchema },
    '/auth/admin/resend-otp': { POST: adminResendOtpSchema },
    // Yacht
    '/yacht/add-yacht': { POST: addyachtSchema },
    '/yacht/all-yachts': { GET: getAllYachtsSchema },
    '/yacht': { GET: getYachtByIdSchema },
    '/yacht/delete-yacht': { DELETE: deleteYachtSchema},
    '/yacht/bareboat-yachts': { GET: null },
    '/yacht/crewed-yachts': { GET: null },
};

export { validationSchemas };
  