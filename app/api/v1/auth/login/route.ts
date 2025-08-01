import { NextRequest } from 'next/server';
import httpStatus from 'http-status-lite';
import { LoginSchema } from '@/schemas/schemas';
import sendResponse from '@/utils/sendResponse';
import MESSAGES from '@/constants/messages';
import comparePassword from '@/utils/comparePassword';
import { createToken } from '@/lib/jwt';
import asyncError from '@/lib/asyncError';
import { setAuthCookies } from '@/lib/cookies';
import { loginSelection } from '@/app/api/v1/auth/login/selection';
import { getUserDetails } from '@/services/user.service';
import { verifyTurnstileToken } from '@/services/auth.service';

const { USER_LOGIN } = MESSAGES;

const loginHandler = async (req: NextRequest) => {
    const body = await req.json();

    // ✅ Validate request body
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
        return sendResponse(
            httpStatus.BAD_REQUEST,
            USER_LOGIN.VALIDATION_ERROR,
            {},
            validation.error.flatten()
        );
    }

    const { email, password, cfToken } = validation.data;

    // ✅ Verify Turnstile token
    const isValid = await verifyTurnstileToken(cfToken);
    if (!isValid) {
        return new Response(
            JSON.stringify({ error: 'Robot verification failed.' }),
            { status: 400 }
        );
    }

    // ✅ Find user by email
    const user = await getUserDetails({ email }, loginSelection);
    if (!user) {
        return sendResponse(httpStatus.UNAUTHORIZED, USER_LOGIN.UNAUTHORIZED);
    }

    // ✅ Validate password
    const isValidPassword = await comparePassword(
        password,
        user.password || ''
    );
    if (!isValidPassword) {
        return sendResponse(httpStatus.UNAUTHORIZED, USER_LOGIN.UNAUTHORIZED);
    }

    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
    };

    // ✅ Generate JWT tokens
    const { accessToken, refreshToken } = await createToken(userData);

    // ✅ Set cookies
    await setAuthCookies({ accessToken, refreshToken });

    const { id, ...userWithoutId } = userData;

    // ✅ Return response with public user info only
    return sendResponse(httpStatus.OK, USER_LOGIN.SUCCESS, userWithoutId);
};

export const POST = asyncError(loginHandler);
