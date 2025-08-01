'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { NavMenu } from '@/components/navbar/nav-menu';
import Loading from '@/components/navbar/loading';
import { NavigationSheet } from '@/components/navbar/navigation-sheet';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutDashboardIcon, LogOut } from 'lucide-react';
import { getData } from '@/lib/axios';

const Navbar = () => {
    const t = useTranslations('navigation');
    const router = useRouter();
    const { isAuthenticated, user, loading, refreshAuth } = useAuth();

    if (loading) return <Loading />;

    return (
        <div className="bg-muted">
            <nav className="h-16 bg-background border-b px-4 xl:px-0">
                <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto">
                    <div className="flex items-center gap-8">
                        <Logo />
                    </div>

                    <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                        {isAuthenticated && user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="h-10 w-10 rounded-full overflow-hidden">
                                        {user?.picture ? (
                                            // Only render when picture is valid
                                            <img
                                                src={user.picture}
                                                alt={user.name || 'User Avatar'}
                                                className="h-10 w-10 object-cover cursor-pointer"
                                            />
                                        ) : user?.name ? (
                                            // Use name fallback
                                            <div className="h-10 w-10 bg-gray-300 flex items-center justify-center text-primary font-bold text-lg cursor-pointer">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        ) : (
                                            // Blank skeleton while waiting
                                            <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full" />
                                        )}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.push('/dashboard/urls')
                                        }
                                        className="cursor-pointer"
                                    >
                                        <LayoutDashboardIcon className="w-4 h-4 mr-2" />
                                        {t('dashboard')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            await getData(
                                                '/api/v1/auth/logout'
                                            );
                                            await refreshAuth();
                                            router.push('/login');
                                        }}
                                        className="cursor-pointer text-red-600"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        {t('logout')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    className="bg-gradient-to-r from-sky-400 to-cyan-300 text-white hidden sm:inline-flex cursor-pointer hover:bg-gradient-to-b hover:text-white"
                                    onClick={() =>
                                        router.push('/dashboard/urls')
                                    }
                                >
                                    {t('dashboard')}
                                </Button>
                                <Button
                                    className="bg-gray-800 cursor-pointer"
                                    onClick={() => router.push('/signup')}
                                >
                                    {t('signup')}
                                </Button>
                            </>
                        )}
                        <div className="md:hidden">
                            <NavigationSheet />
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
