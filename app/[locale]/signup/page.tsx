'use client';

import { useTranslations } from 'next-intl';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SignupSchema } from '@/schemas/schemas';
import { handleSignup } from '@/lib/actions/signup';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { handleGoogleLogin } from '@/lib/actions/auth';
import GoogleLogo from '@/components/googleLogo';
import SubmitButton from '@/components/SubmitButton';
import { PasswordField, TextField } from '@/components/CustomFormField';
import TurnstileField from '@/components/TurnstileField';

const SignUpPage = () => {
    const t = useTranslations('auth.signup');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [cfToken, setCfToken] = useState<string | null>(null);

    const form = useForm<z.infer<typeof SignupSchema>>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            password: '',
            cfToken: '',
        },
        resolver: zodResolver(SignupSchema),
    });

    const onSubmit = async (data: z.infer<typeof SignupSchema>) => {
        const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY;

        // Only require Turnstile token if site key is configured
        if (siteKey && !cfToken) {
            form.setError('email', {
                type: 'manual',
                message: t('turnstileError'),
            });
            return;
        }

        await handleSignup(
            { ...data, cfToken: cfToken || 'dev-bypass' },
            setLoading,
            router
        );
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="w-full h-full grid lg:grid-cols-2 p-4">
                <div className="max-w-xs m-auto w-full flex flex-col items-center">
                    <Logo />
                    <p className="mt-4 text-xl font-bold tracking-tight text-primary">
                        {t('title')}
                    </p>

                    <Button
                        onClick={handleGoogleLogin}
                        className="mt-8 w-full gap-3 cursor-pointer"
                    >
                        <GoogleLogo />
                        {t('continueWithGoogle')}
                    </Button>

                    <div className="my-7 w-full flex items-center justify-center overflow-hidden">
                        <Separator />
                        <span className="text-sm px-2">{t('or')}</span>
                        <Separator />
                    </div>

                    <Form {...form}>
                        <form
                            className="w-full space-y-4"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <TextField
                                control={form.control}
                                name="name"
                                label={t('name')}
                                placeholder={t('name')}
                            />
                            <TextField
                                control={form.control}
                                name="email"
                                label={t('email')}
                                type="email"
                                placeholder={t('email')}
                            />
                            <PasswordField
                                control={form.control}
                                name="password"
                                label={t('password')}
                                placeholder={t('password')}
                            />

                            <TurnstileField
                                onVerify={(token) => {
                                    setCfToken(token);
                                    form.setValue('cfToken', token);
                                }}
                            />

                            <SubmitButton
                                disabled={
                                    !form.formState.isValid ||
                                    loading ||
                                    !cfToken
                                }
                                loading={loading}
                                loadingLabel={t('validationError')}
                                label={t('submitButton')}
                            />
                        </form>
                    </Form>

                    <p className="mt-5 text-sm text-center">
                        {t('haveAccount')}
                        <Link
                            href="/login"
                            className="ml-1 underline text-muted"
                        >
                            {t('loginLink')}
                        </Link>
                    </p>
                </div>

                <div className="bg-gray-50 hidden lg:block rounded-lg" />
            </div>
        </div>
    );
};

export default SignUpPage;
